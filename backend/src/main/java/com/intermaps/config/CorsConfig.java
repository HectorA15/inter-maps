package com.intermaps.config;


import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {

        /*
        IMPORTANTE: Se permite el acceso desde cualquier origen para todas las rutas, métodos y cabeceras.
        Esto es útil para desarrollo y pruebas, pero en producción se recomienda restringir los orígenes permitidos.
        */
        registry.addMapping("/**")
                .allowedOriginPatterns("*")  // en un futuro cambiar a algo como "https://InterMaps.com"
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);

        WebMvcConfigurer.super.addCorsMappings(registry);
    }
}
