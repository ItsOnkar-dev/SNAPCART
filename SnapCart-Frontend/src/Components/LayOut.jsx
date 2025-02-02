import ImageCarousel from "./ImageCarousel"
import ProductList from "./ProductList/ProductList"



const LayOut = () => {
  return (
    <>
      <div className="flex flex-col gap-20 px-4 md:px-10 py-28 md:py-36">
        <ImageCarousel />
        <ProductList />
      </div>
    </>
  )
}

export default LayOut
