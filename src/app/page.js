import { MotionExperience } from "@/features/motion/components/MotionExperience";
import { About } from "@/features/public-site/components/About";
import { Footer } from "@/features/public-site/components/Footer";
import { Hero } from "@/features/public-site/components/Hero";
import { Navbar } from "@/features/public-site/components/Navbar";
import { Portfolio } from "@/features/public-site/components/Portfolio";
import { Services } from "@/features/public-site/components/Services";
import { publicSiteContent } from "@/features/public-site/content/site-content";

import styles from "./page.module.css";

export const metadata = {
  title: "DDS Photographer",
  description:
    "DDS Photographer public website preview featuring portfolio, services, and contact information.",
};

export default function Home() {
  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <Navbar items={publicSiteContent.navigation} />
      <MotionExperience />
      <main id="main-content">
        <Hero
          content={publicSiteContent.hero}
          items={publicSiteContent.portfolio.slice(0, 4)}
        />
        <About content={publicSiteContent.about} />
        <Portfolio items={publicSiteContent.portfolio} />
        <Services items={publicSiteContent.services} />
      </main>
      <Footer
        contact={publicSiteContent.contact}
        navigation={publicSiteContent.navigation}
        services={publicSiteContent.services}
        socialLinks={publicSiteContent.socialLinks}
      />
    </>
  );
}
