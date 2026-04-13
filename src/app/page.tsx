"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

function Section({
  label,
  children,
  delay = 0,
}: {
  label?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" as const, delay },
        },
      }}
      className="mb-12"
    >
      {label && (
        <p
          className="text-xs text-muted uppercase tracking-[0.15em] mb-3"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {label}
        </p>
      )}
      {children}
    </motion.section>
  );
}

function ExtLink({
  href,
  children,
  badge,
}: {
  href: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-foreground hover:text-accent-blue transition-colors"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      {children}
      {badge && (
        <span className="text-[10px] text-muted border border-border rounded px-1.5 py-0.5">
          {badge}
        </span>
      )}
      <ExternalLink size={12} className="text-muted" />
    </a>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-32 md:pt-40 px-4">
      <div className="max-w-[540px] w-full">
        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-16"
        >
          <Image
            src="/logo.svg"
            alt=""
            width={40}
            height={35}
            className="mb-6 dark:invert"
          />
          <h1
            className="text-2xl md:text-3xl tracking-[0.15em] uppercase mb-3"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 300 }}
          >
            Systema Robotica
          </h1>
          <p className="text-base text-muted italic mb-6">
            On the Order and Evolution of Robotkind
          </p>
          <p className="text-sm leading-relaxed text-foreground/80 mb-4">
            A treatise defining the true nature of robots, proposing the
            definitive Robot Taxonomy, and exploring the societal roles of
            robotkind in a future of non-human superintelligences. From
            differentiating robots and machines to introducing a novel test for
            sentience.
          </p>
          <p
            className="text-xs text-muted"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            by Ali Ahmed &middot;{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              CC BY 4.0
            </a>{" "}
            &middot; First Edition, 2024
          </p>
        </motion.div>

        {/* Treatise links */}
        <Section label="Treatise" delay={0.1}>
          <div className="flex flex-col gap-2">
            <a
              href="https://www.lesswrong.com/posts/iy8XANvSr9u3czm7o/systema-robotica"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-foreground hover:text-accent-blue transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Read the Treatise <ExternalLink size={12} className="text-muted" />
            </a>
            <Link
              href="/glossary"
              className="text-sm text-foreground hover:text-accent-blue transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Glossary
            </Link>
            <Link
              href="/archive"
              className="text-sm text-foreground hover:text-accent-blue transition-colors"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Robot Archive
            </Link>
          </div>
        </Section>

        {/* Get the Book */}
        <Section label="Get the Book" delay={0.15}>
          <div className="flex flex-col gap-2">
            <ExtLink href="https://www.amazon.com/dp/B0DDFQF7WV" badge="Paperback">
              Amazon
            </ExtLink>
            <ExtLink
              href="https://www.researchgate.net/publication/383159462_On_the_Order_and_Evolution_of_Robotkind"
              badge="Preprint"
            >
              ResearchGate
            </ExtLink>
          </div>
        </Section>

        {/* Reviews */}
        <Section label="Reviews" delay={0.2}>
          <div className="flex flex-col gap-6">
            <blockquote className="text-sm leading-relaxed">
              <p className="italic text-foreground/80 mb-2">
                &ldquo;Clearly an enormous amount of work and thought went into
                this project. It&rsquo;s the first serious attempt to create a
                systematic vocabulary around the intelligent technology rapidly
                taking over our world.&rdquo;
              </p>
              <cite
                className="text-xs text-muted not-italic"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                &mdash; Michael Graziano, Professor of Psychology and
                Neuroscience at Princeton
              </cite>
            </blockquote>
            <blockquote className="text-sm leading-relaxed">
              <p className="italic text-foreground/80 mb-2">
                &ldquo;Is your robot a Colossal, a Servon, or a Mechatron? In
                Ali Ahmed&rsquo;s &lsquo;Tractatus,&rsquo; you will discover
                the most comprehensive taxonomy for both current and future robot
                types.&rdquo;
              </p>
              <cite
                className="text-xs text-muted not-italic"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                &mdash; Luis Sentis, Co-founder of Apptronik Systems, Head of
                Human Centered Robotics Laboratory at UT Austin
              </cite>
            </blockquote>
          </div>
        </Section>

        {/* Author */}
        <Section label="Author" delay={0.25}>
          <div>
            <p
              className="text-sm font-medium mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ali Ahmed
            </p>
            <p className="text-xs text-muted leading-relaxed">
              Roboticist, inventor of the self-driving store, co-founder &amp;
              CEO of Robomart, mentor at Singularity University. Has spent the
              better part of a decade working in the robotics field and
              pondering the true nature of robots.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
