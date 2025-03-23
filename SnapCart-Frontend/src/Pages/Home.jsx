import ImageCarousel from "../Components/ImageCarousel";
import ProductList from "../Components/ProductList/ProductList";

const Home = () => {
  return (
    <>
      <main className="flex flex-col gap-20 px-4 md:px-10 py-28 md:py-36">
        <ImageCarousel />
        <ProductList />
      </main>
    </>
  );
};

export default Home;
