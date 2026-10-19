import FeaturedCarousel from "@/components/home/featured-carousel";
import HeroNewsGrid from "@/components/home/hero-news-grid";
import NewsletterBanner from "@/components/home/newsletter-banner";
import TopicPillList from "@/components/home/topic-pill-list";
import Footer from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f7f3] text-[#171717] selection:bg-[#d8ff48] selection:text-black">
      <Header />
      <FeaturedCarousel />
      <HeroNewsGrid />
      <TopicPillList />
      <NewsletterBanner />
      <Footer />
    </div>
  );
}
