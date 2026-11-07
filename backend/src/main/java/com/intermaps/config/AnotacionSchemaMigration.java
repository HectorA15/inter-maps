package com.intermaps.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;
import java.sql.SQLException;

@Component
@Order(0)
@RequiredArgsConstructor
public class AnotacionSchemaMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        if (!esSQLite()) {
            return;
        }

        Set<String> columnas = jdbcTemplate.query(
                "PRAGMA table_info(anotaciones)",
                (resultSet, rowNum) -> resultSet.getString("name")
        ).stream().collect(Collectors.toSet());

        if (!columnas.contains("edificio_id")) {
            jdbcTemplate.execute("ALTER TABLE anotaciones ADD COLUMN edificio_id INTEGER");
        }
        if (!columnas.contains("espacio_id")) {
            jdbcTemplate.execute("ALTER TABLE anotaciones ADD COLUMN espacio_id INTEGER");
        }
        if (!columnas.contains("zona_id")) {
            jdbcTemplate.execute("ALTER TABLE anotaciones ADD COLUMN zona_id INTEGER");
        }
        if (!columnas.contains("zona_nombre")) {
            jdbcTemplate.execute("ALTER TABLE anotaciones ADD COLUMN zona_nombre VARCHAR(100)");
        }
        if (!columnas.contains("nivel_zoom")) {
            jdbcTemplate.execute(
                    "ALTER TABLE anotaciones ADD COLUMN nivel_zoom INTEGER NOT NULL DEFAULT 1"
            );
        }
        if (!columnas.contains("creado_por")) {
            jdbcTemplate.execute(
                    "ALTER TABLE anotaciones ADD COLUMN creado_por VARCHAR(20) NOT NULL DEFAULT 'ADMIN'"
            );
        }
    }

    private boolean esSQLite() {
        if (jdbcTemplate.getDataSource() == null) return false;
        try (var connection = jdbcTemplate.getDataSource().getConnection()) {
            return connection.getMetaData().getDatabaseProductName()
                    .toLowerCase()
                    .contains("sqlite");
        } catch (SQLException exception) {
            throw new IllegalStateException(
                    "No se pudo identificar la base de datos para migrar anotaciones.",
                    exception
            );
        }
    }
}
