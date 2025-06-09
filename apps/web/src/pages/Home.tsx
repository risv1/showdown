import Footer from "../components/common/Footer";
import Bento from "../components/home/Bento";
import Hero from "../components/home/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950">
      <Hero />
      <Bento />
      <Footer />
    </div>
  );
}
