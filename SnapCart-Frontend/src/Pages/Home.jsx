import Banner from "../Components/Banner";
import ProductList from "../Components/Products/ProductList";

const Home = () => {
  return (
    <>
      <main className="flex flex-col gap-16 py-16">
        <Banner />
        <ProductList />
      </main>
    </>
  );
};

export default Home;
