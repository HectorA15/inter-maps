import type { Edificio, SearchResult } from "../../interfaces/ApiInterfaces";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface ImagenProps {
  dato: SearchResult | Edificio | null;
}

export function Imagen({ dato }: ImagenProps) {
  if (!dato) return null;

  const ImagenMostrar =
    "imagenes" in dato && Array.isArray(dato.imagenes) ? dato.imagenes : [];
  const imagenFallback = "/Imagenes/Prueba.jpg";

  if (ImagenMostrar.length === 0) {
    return (
      <img
        src={imagenFallback}
        className="h-64 w-full object-cover"
        alt={`Imagen no disponible de ${dato.nombre}`}
      />
    );
  }

  return (
    <div>
      <div className="w-full bg-gray-100 dark:bg-gray-800">
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
          className="h-auto w-full shadow-sm"
        >
          {ImagenMostrar.map((ruta, index) => (
            <SwiperSlide key={index}>
              <img
                src={ruta}
                className="h-64 w-full object-cover"
                alt={`Vista de ${dato.nombre} ${index + 1}`}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = imagenFallback;
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
