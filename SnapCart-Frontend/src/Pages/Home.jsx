import Banner from "../Components/Banner";
import MainFooter from "../Components/Footer/MainFooter";
import ProductList from "../Components/Products/ProductList";

const Home = () => {
  return (
    <>
      <main className="flex flex-col gap-16 py-16">
        <Banner />
        <ProductList />
        <MainFooter />
      </main>
    </>
  );
};

export default Home;
