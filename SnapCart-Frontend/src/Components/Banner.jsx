
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import Joggers from "../assets/joggers.webp"
import SummerShirts from "../assets/Summer-Shirts.webp"
import Shoes from "../assets/Shoes.webp"
import Perfume from "../assets/Perfume.webp"
import SummerSkirts from "../assets/girl_summer.webp"
import socks from "../assets/socks.webp"
import Backpack from "../assets/Backpack.webp"

const Banner = () => {
  const images = [
    {
      id: 1,
      src: Joggers,
      alt: "Colorful joggers on a white background",
    },
    {
      id: 2,
      src: SummerShirts,
      alt: "Summer shirts",
    },
    {
      id: 3,
      src: Shoes,
      alt: "Sneakers",
    },
    {
      id: 4,
      src: Perfume,
      alt: "Perfumes",
    },
    {
      id: 5,
      src: SummerSkirts,
      alt: "Summer skirts",
    },
    {
      id: 6,
      src: socks,
      alt: "Socks",
    },
    {
      id: 7,
      src: Backpack,
      alt: "Backpacks",
    },
  ]

  return (
    <div className="block w-full mx-auto md:px-4 relative cursor-pointer">
      <Carousel
        showArrows={true}
        showStatus={false}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={3000}
        stopOnHover={false}
        swipeable={true}
        emulateTouch={true}
        dynamicHeight={false}
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-all duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )
        }
      >
        {images.map((image) => (
          <div key={image.id} className="h-[50vh] sm:h-[70vh]">
            <img src={image.src} alt={image.alt} className="object-cover w-full h-full" />
          </div>
        ))}
      </Carousel>
    </div>
  )
}

export default Banner

