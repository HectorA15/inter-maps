import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Buscador } from '../components/Buscador';
import { CatalogoService } from '../services/apiClient';
import type { SearchResult } from '../interfaces/ApiInterfaces';

vi.mock('../services/apiClient', () => ({
  CatalogoService: { buscar: vi.fn() },
}));

const mockBuscar = vi.mocked(CatalogoService.buscar);

const datosLocal: SearchResult[] = [
  { id: 1, nombre: 'Edificio A', tipo: 'EDIFICIO' },
  { id: 2, nombre: 'Cafetería Central', tipo: 'ESPACIO' },
  { id: 3, nombre: 'Laboratorio de Redes', tipo: 'ESPACIO' },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('Buscador', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza input con placeholder por defecto', () => {
    render(<Buscador />);
    expect(screen.getByPlaceholderText('Buscar lugar, aula o edificio...')).toBeInTheDocument();
  });

  it('placeholder custom', () => {
    render(<Buscador placeholder="Buscar..." />);
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
  });

  it('no muestra dropdown al inicio ni con input vacio', async () => {
    render(<Buscador datos={datosLocal} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    await userEvent.type(input, '   ');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('filtra localmente ignorando acentos y case', async () => {
    render(<Buscador datos={datosLocal} />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    await userEvent.type(input, 'cafeteria');
    expect(await screen.findByText('Cafetería Central')).toBeInTheDocument();
  });

  it('filtra case insensitive', async () => {
    render(<Buscador datos={datosLocal} />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    await userEvent.type(input, 'EDIFICIO');
    expect(await screen.findByText('Edificio A')).toBeInTheDocument();
  });

  it('muestra Sin resultados cuando no hay match local', async () => {
    render(<Buscador datos={datosLocal} />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    await userEvent.type(input, 'inexistente');
    expect(await screen.findByText(/Sin resultados para/)).toBeInTheDocument();
  });

  it('onSelect se dispara al click y cierra dropdown', async () => {
    const onSelect = vi.fn();
    render(<Buscador datos={datosLocal} onSelect={onSelect} />);
    const input = screen.getByPlaceholderText(/Buscar lugar/) as HTMLInputElement;
    await userEvent.type(input, 'Lab');
    const item = await screen.findByText('Laboratorio de Redes');
    await userEvent.click(item);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Laboratorio de Redes' }));
    expect(input.value).toBe('Laboratorio de Redes');
    // esperar un tick para asegurar que el efecto de seleccion no reabre
    await sleep(50);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('boton limpiar resetea texto y resultados', async () => {
    render(<Buscador datos={datosLocal} />);
    const input = screen.getByPlaceholderText(/Buscar lugar/) as HTMLInputElement;
    await userEvent.type(input, 'Edificio');
    expect(await screen.findByText('Edificio A')).toBeInTheDocument();
    const btn = screen.getByLabelText('Limpiar busqueda');
    await userEvent.click(btn);
    expect(input.value).toBe('');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('navegacion por teclado ArrowDown/ArrowUp/Enter', async () => {
    const onSelect = vi.fn();
    render(<Buscador datos={datosLocal} onSelect={onSelect} />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    await userEvent.type(input, 'a');
    await screen.findByText('Edificio A');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalled();
  });

  it('Escape cierra dropdown', async () => {
    render(<Buscador datos={datosLocal} />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    await userEvent.type(input, 'Edificio');
    await screen.findByText('Edificio A');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('click fuera cierra dropdown', async () => {
    render(
      <div>
        <Buscador datos={datosLocal} />
        <button>fuera</button>
      </div>
    );
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    await userEvent.type(input, 'Edificio');
    await screen.findByText('Edificio A');
    await userEvent.click(screen.getByText('fuera'));
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  // Modo remoto (sin datos) - usa timers reales, debounce 100ms
  it('modo remoto: llama CatalogoService.buscar con debounce 100ms y muestra resultados', async () => {
    mockBuscar.mockResolvedValue([{ id: 10, nombre: 'Edificio B', tipo: 'EDIFICIO' }]);
    render(<Buscador />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    fireEvent.change(input, { target: { value: 'Edificio' } });
    expect(mockBuscar).not.toHaveBeenCalled();
    await waitFor(() => expect(mockBuscar).toHaveBeenCalledWith('Edificio', expect.any(AbortSignal)), { timeout: 2000 });
    expect(await screen.findByText('Edificio B')).toBeInTheDocument();
  });

  it('modo remoto: debounce cancela peticion anterior con AbortController', async () => {
    mockBuscar.mockResolvedValue([]);
    render(<Buscador />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    fireEvent.change(input, { target: { value: 'a' } });
    await sleep(50);
    fireEvent.change(input, { target: { value: 'ab' } });
    await waitFor(() => expect(mockBuscar).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(mockBuscar).toHaveBeenCalledWith('ab', expect.any(AbortSignal));
  });

  it('modo remoto: error de red no crashea y apaga spinner', async () => {
    mockBuscar.mockRejectedValue({ name: 'NetworkError', message: 'fail' });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Buscador />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    fireEvent.change(input, { target: { value: 'x' } });
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled(), { timeout: 2000 });
    await sleep(50);
    expect(document.querySelector('.spinner-cargando')).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('modo remoto: AbortError es silenciado', async () => {
    mockBuscar.mockRejectedValue({ name: 'AbortError' });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Buscador />);
    const input = screen.getByPlaceholderText(/Buscar lugar/);
    fireEvent.change(input, { target: { value: 'test' } });
    await waitFor(() => expect(mockBuscar).toHaveBeenCalled(), { timeout: 2000 });
    await sleep(150);
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('no contiene emojis en el DOM', async () => {
    const { container } = render(<Buscador datos={datosLocal} />);
    await userEvent.type(screen.getByPlaceholderText(/Buscar lugar/), 'a');
    await screen.findByText('Edificio A');
    const text = container.textContent || '';
    expect(text).not.toContain('🔍');
    // tampoco debe haber emoji en boton limpiar
    expect(container.innerHTML).not.toContain('🔍');
  });
});
