import FeaturedMain from "./components/featured-main";
import FooterSection from "./components/footer";
import { Header } from "./components/header";
import HeroNewsGrid from "./components/hero-news-grid";
import NewsletterBanner from "./components/news-letter-banner";
import TopicPillList from "./components/topic-pill-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f7f3] text-[#171717] selection:bg-[#d8ff48] selection:text-black">
      <Header />
      <FeaturedMain />
      <HeroNewsGrid />
      <TopicPillList />
      <NewsletterBanner />
      <FooterSection />
    </div>
  );
}
