import { MotionExperience } from "@/features/motion/components/MotionExperience";
import { Contact } from "@/features/public-site/components/Contact";
import { Footer } from "@/features/public-site/components/Footer";
import { Navbar } from "@/features/public-site/components/Navbar";
import { publicSiteContent } from "@/features/public-site/content/site-content";

import styles from "./page.module.css";

export const metadata = {
  title: "Contact | DDS Photographer",
  description: "Contact DDS Photographer to begin planning your story.",
};

export default function ContactPage() {
  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        Skip to contact details
      </a>
      <Navbar items={publicSiteContent.navigation} />
      <MotionExperience />
      <main id="main-content">
        <Contact content={publicSiteContent.contact} />
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
