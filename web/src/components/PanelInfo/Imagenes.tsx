import type { Edificio, SearchResult } from "../../interfaces/ApiInterfaces";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const ImagenesEdificios: Record<number, string[]> = {
  19: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  22: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  20: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  16: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  13: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  12: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  11: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  15: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  4: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  9: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  1: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  2: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  18: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  28: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  3: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  30: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  7: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  8: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  17: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  32: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  14: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  10: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  6: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  5: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  34: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  [-1]: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  31: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  33: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
  29: ["/Imagenes/Prueba.jpg", "/Imagenes/Prueba.jpg"],
};

interface ImagenProps {
  dato: SearchResult | Edificio | null;
}

export function Imagen({ dato }: ImagenProps) {
  if (!dato) return null;

  const ImagenMostrar = ImagenesEdificios[dato.id] || [];
  return (
    <div>
      <div className="w-full bg-gray-100 ">
        <Swiper
          slidesPerView={1}
          grabCursor={true}
          modules={[Pagination, Navigation]}
          navigation={true}
          pagination={{ el: ".custom-pagination", clickable: true }}
          style={
            {
              "--swiper-navigation-color": "#000000",
              "--swiper-navigation-size": "32px",
            } as React.CSSProperties
          }
          className="w-full h-auto mt-4 rounded-md shadow-sm"
        >
          {ImagenMostrar.map((ruta, index) => (
            <SwiperSlide key={index}>
              <img
                src={ruta}
                className="w-full h-48 object-cover rounded-md"
                alt={`Vista de ${dato.nombre} ${index + 1}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="custom-pagination !static flex justify-center mt-0"></div>
      </div>
    </div>
  );
}
