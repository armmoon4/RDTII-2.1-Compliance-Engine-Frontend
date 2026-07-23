import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bolt, Shield, Brain, Layers, Globe, ChevronRight,
  ArrowUpRight, Search, FileText, CheckCircle2, Play
} from "lucide-react";
import PipelineArchitecture from "./PipelineArchitecture";

interface WelcomeProps {
  onEnter: () => void;
}

const logos = [
  { src: "/assets/swipelogo/ESCAP_Secondary_Logo_Blue.png", name: "UNESCAP" },
  { src: "/assets/swipelogo/UNCTAD_Master_Logo_Blue.png", name: "UNCTAD" },
  { src: "/assets/swipelogo/worldbankv2-01.jpg", name: "World Bank" },
  { src: "/assets/swipelogo/APRU.png", name: "APRU" },
  { src: "/assets/swipelogo/UNECA.png", name: "UNECA" },
  { src: "/assets/swipelogo/AI_2030.png", name: "AI 2030" },
  { src: "/assets/swipelogo/eclac_logo.svg", name: "ECLAC" },
  { src: "/assets/swipelogo/HUST.png", name: "HUST" },
  { src: "/assets/swipelogo/LOGO-EUI.png", name: "EUI" },
  { src: "/assets/swipelogo/Logo_UFMG.png", name: "UFMG" },
  { src: "/assets/swipelogo/Maynooth_University_Logo.png", name: "Maynooth" },
  { src: "/assets/swipelogo/cmkl.png", name: "CMKL" },
  { src: "/assets/swipelogo/kmitl.png", name: "KMITL" },
  { src: "/assets/swipelogo/smu-2.png", name: "SMU" },
];

export default function WelcomeScreen({ onEnter }: WelcomeProps) {
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [activeResIndex, setActiveResIndex] = useState(1);
  const pageRef = useRef<HTMLDivElement>(null);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 650);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const gsapWin = (window as any).gsap;
    if (!gsapWin) return;

    if ((window as any).ScrollTrigger) {
      gsapWin.registerPlugin((window as any).ScrollTrigger);
    }

    const ctx = gsapWin.context(() => {
      // ─── INITIAL STATES ───
      gsapWin.set(".header > *", { y: -20, opacity: 0 });
      gsapWin.set(".eyebrow", { y: 12, opacity: 0 });
      gsapWin.set(".title .word", { yPercent: 110, opacity: 0 });
      gsapWin.set(".title-desc", { opacity: 0, x: -10 });
      gsapWin.set(".paren-group .paren", { scale: 0, opacity: 0 });
      gsapWin.set(".avatar-group", { scale: 0, opacity: 0 });
      gsapWin.set(".dna-icon", { scale: 0, rotation: -45, opacity: 0 });
      gsapWin.set(".future-tag", { opacity: 0, x: -10 });
      gsapWin.set(".badge", { scale: 0, rotation: -90, opacity: 0 });
      gsapWin.set(".res-item", { y: 16, opacity: 0 });
      gsapWin.set(".wave-wrap", { x: 120, opacity: 0 });
      gsapWin.set(".wave-glow", { opacity: 0 });
      gsapWin.set(".bg-text", { opacity: 0, scale: 1.1 });

      // ─── PAGE LOAD TIMELINE ───
      const tl = gsapWin.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.15
      });

      tl.to(".header > *", { y: 0, opacity: 1, duration: 0.7, stagger: 0.07 })
        .to(".wave-glow", { opacity: 1, duration: 1.2 }, "-=.5")
        .to(".wave-wrap", { x: 0, opacity: 1, duration: 1.4, ease: "power3.out" }, "-=1.2")
        .to(".bg-text", { opacity: 1, scale: 1, duration: 1.4, ease: "power3.out" }, "-=1.2")
        .to(".eyebrow", { y: 0, opacity: 1, duration: 0.5 }, "-=1")
        .to(".title .word", { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.05, ease: "power4.out" }, "-=.8")
        .to(".title-desc", { x: 0, opacity: 1, duration: 0.6 }, "-=.5")
        .to(".paren-group .paren", { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(2)" }, "-=.45")
        .to(".avatar-group", { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=.3")
        .to(".dna-icon", { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }, "-=.4")
        .to(".future-tag", { x: 0, opacity: 1, duration: 0.5 }, "-=.3")
        .to(".badge", { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=.5")
        .to(".res-item", { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, "-=.4");

      // ─── WAVE FLOAT ───
      gsapWin.to(".wave-wrap", { y: -18, rotation: -1.2, duration: 5.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsapWin.to(".wave-glow", { y: 12, scale: 1.05, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsapWin.to(".wave-glow.b", { y: -16, x: -10, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsapWin.to(".badge", { y: "+=8", duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsapWin.to(".dna-icon svg", { rotation: 12, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut", transformOrigin: "50% 50%" });
      gsapWin.to(".avatar-group", { rotation: 3, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });

      // ─── MOUSE PARALLAX ───
      if (!window.matchMedia("(pointer: coarse)").matches) {
        const handleMouseMove = (e: MouseEvent) => {
          const x = e.clientX / window.innerWidth - 0.5;
          const y = e.clientY / window.innerHeight - 0.5;
          gsapWin.to(".wave-wrap", { x: x * 30, duration: 1.2, ease: "power3.out", overwrite: "auto" });
          gsapWin.to(".wave-glow", { x: x * 60, y: y * 40, duration: 1.4, ease: "power3.out", overwrite: "auto" });
          gsapWin.to(".badge", { x: x * -16, y: y * -10, duration: 1.2, ease: "power3.out", overwrite: "auto" });
          gsapWin.to(".bg-text", { x: x * -20, duration: 1.4, ease: "power3.out", overwrite: "auto" });
        };
        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
      }

      // ─── CARD HOVER TILT ───
      const cards = document.querySelectorAll(".clay-card");
      cards.forEach((card) => {
        const el = card as HTMLElement;
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          gsapWin.to(el, { rotateY: x * 4, rotateX: -y * 4, duration: 0.5, ease: "power2.out", transformPerspective: 900 });
        };
        const onLeave = () => {
          gsapWin.to(el, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1,.6)" });
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const doubledLogos = [...logos, ...logos];

  return (
    <AnimatePresence mode="wait">
      {!exiting && (
        <motion.div
          key="welcome-hero"
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-screen-root"
          ref={pageRef}
        >
          <style>{`
            :root {
              --bg: #ececef;
              --bg-2: #e4e4e8;
              --text: #0a0a0c;
              --text-2: #2b2b30;
              --mute: #74747c;
              --mute-2: #9a9aa3;
              --card: #ffffff;
              --card-soft: #f7f7fa;
              --line: rgba(0, 0, 0, 0.06);
              --line-2: rgba(0, 0, 0, 0.1);
              --accent: #1a8aff;
              --teal: #2cb7b3;
              --tile: #111115;
              --font: "Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif, system-ui;
            }

            .w-screen-root {
              position: fixed;
              inset: 0;
              z-index: 9999;
              overflow-y: auto;
              overflow-x: hidden;
              background: var(--bg);
              color: var(--text);
              font-family: var(--font);
              font-weight: 400;
              line-height: 1.45;
              -webkit-font-smoothing: antialiased;
            }

            .w-screen-root::before {
              content: "";
              position: fixed;
              inset: 0;
              pointer-events: none;
              z-index: 0;
              background: radial-gradient(
                circle at 1px 1px,
                rgba(15, 15, 20, 0.045) 1px,
                transparent 1.4px
              ) 0 0/22px 22px;
              opacity: 0.6;
            }

            .page {
              position: relative;
              z-index: 1;
              max-width: 1360px;
              margin: 0 auto;
              padding: 28px clamp(20px, 3vw, 40px) 60px;
              min-height: 100vh;
            }

            /* ─── WAVE VISUAL & GLOW ─── */
            .wave-wrap {
              position: absolute;
              inset: -60px -180px auto 0;
              top: -60px;
              right: -160px;
              z-index: 2;
              pointer-events: none;
              width: min(1300px, 92vw);
              height: auto;
              filter: drop-shadow(0 30px 40px rgba(20, 80, 160, 0.12));
              will-change: transform;
            }
            .wave-wrap img {
              width: 100%;
              height: auto;
              display: block;
              transform-origin: center;
            }
            .wave-glow {
              position: absolute;
              top: 0;
              right: -120px;
              width: 60%;
              aspect-ratio: 1;
              background: radial-gradient(
                closest-side,
                rgba(40, 190, 255, 0.35),
                transparent 70%
              );
              filter: blur(60px);
              z-index: 1;
              pointer-events: none;
            }
            .wave-glow.b {
              top: 35%;
              right: 10%;
              width: 40%;
              background: radial-gradient(
                closest-side,
                rgba(70, 230, 180, 0.3),
                transparent 70%
              );
            }

            /* ─── GIANT BACKGROUND TEXT ─── */
            .bg-text {
              position: absolute;
              left: 50%;
              top: 48%;
              transform: translate(-50%, -50%);
              z-index: 1;
              font-family: 'Archivo Black', var(--font);
              font-size: clamp(60px, 18vw, 300px);
              line-height: 0.85;
              letter-spacing: -0.04em;
              color: transparent;
              -webkit-text-stroke: 1.5px rgba(15, 15, 25, 0.08);
              pointer-events: none;
              white-space: nowrap;
              user-select: none;
              text-transform: uppercase;
            }

            /* ─── HEADER (PILL NAV) ─── */
            .header {
              position: relative;
              z-index: 20;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
              padding: 12px 16px;
              background: rgba(255, 255, 255, 0.72);
              backdrop-filter: blur(20px) saturate(150%);
              -webkit-backdrop-filter: blur(20px) saturate(150%);
              border: 1px solid rgba(255, 255, 255, 0.85);
              border-radius: 999px;
              box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset,
                0 8px 28px rgba(20, 40, 80, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
            }

            .logo {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              padding: 6px 14px 6px 8px;
              flex-shrink: 0;
              text-decoration: none;
              color: inherit;
              cursor: pointer;
            }

            .logo-mark {
              width: 34px;
              height: 34px;
              background: linear-gradient(135deg, #0f172a, #1e293b);
              border-radius: 10px;
              display: grid;
              place-items: center;
              color: white;
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -2px 4px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.18);
            }

            .logo-mark svg {
              width: 18px;
              height: 18px;
            }

            .logo-text {
              display: flex;
              flex-direction: column;
              line-height: 1.05;
            }

            .logo-text .a {
              font-family: 'Inter Tight', var(--font);
              font-weight: 800;
              font-size: 15px;
              letter-spacing: -0.02em;
              color: #0f172a;
            }

            .logo-text .b {
              font-size: 11px;
              font-weight: 600;
              color: #4f46e5;
              letter-spacing: 0.5px;
            }

            .nav-pills {
              display: flex;
              align-items: center;
              gap: 6px;
              flex: 1;
              justify-content: center;
            }

            .nav-pill {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 9px 18px;
              border-radius: 999px;
              font-size: 14px;
              font-weight: 500;
              color: var(--text-2);
              transition: background 0.25s, color 0.25s, transform 0.25s;
              cursor: pointer;
              text-decoration: none;
            }

            .nav-pill svg {
              width: 15px;
              height: 15px;
              opacity: 0.75;
            }

            .nav-pill:hover {
              background: rgba(0, 0, 0, 0.05);
              transform: translateY(-1px);
              color: var(--text);
            }

            .nav-pill.active {
              background: var(--text);
              color: white;
            }

            .nav-pill.active svg {
              opacity: 0.95;
            }

            .header-cta {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 6px 6px 6px 20px;
              background: white;
              border-radius: 999px;
              box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset,
                0 4px 14px rgba(0, 0, 0, 0.08);
              transition: transform 0.25s, box-shadow 0.3s;
              cursor: pointer;
              text-decoration: none;
              color: var(--text);
            }

            .header-cta:hover {
              transform: translateY(-1px);
              box-shadow: 0 1px 0 rgba(255, 255, 255, 0.9) inset,
                0 8px 22px rgba(0, 0, 0, 0.12);
            }

            .cta-dot {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: linear-gradient(135deg, #4f46e5, #6366f1);
              color: white;
              display: grid;
              place-items: center;
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2),
                0 4px 12px rgba(99, 102, 241, 0.3);
            }

            .cta-dot svg {
              width: 15px;
              height: 15px;
            }

            .cta-text {
              font-size: 14px;
              font-weight: 600;
              padding-right: 2px;
            }

            .cta-arrows {
              display: inline-flex;
              align-items: center;
              gap: 1px;
              margin-left: 2px;
              color: var(--mute);
            }

            .cta-arrows svg {
              width: 14px;
              height: 14px;
            }

            /* ─── HERO ─── */
            .hero {
              position: relative;
              z-index: 5;
              padding: 56px 0 32px;
            }

              .eyebrow {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: clamp(10px, 1.5vw, 12px);
                font-weight: 600;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #4f46e5;
                background: rgba(99, 102, 241, 0.08);
                border: 1px solid rgba(99, 102, 241, 0.18);
                padding: 6px 16px;
                border-radius: 999px;
                margin-bottom: 18px;
                max-width: 100%;
                white-space: nowrap;
              }

            .eyebrow::before {
              content: "";
              display: inline-block;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #6366f1;
              box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
            }

            /* TITLE */
            .title {
              font-family: 'Inter Tight', var(--font);
              font-size: clamp(38px, 6.2vw, 94px);
              font-weight: 800;
              line-height: 0.94;
              letter-spacing: -0.035em;
              color: var(--text);
              margin: 0;
              position: relative;
              z-index: 4;
            }

            .title-line {
              display: flex;
              align-items: center;
              gap: clamp(10px, 1.4vw, 22px);
              flex-wrap: wrap;
              overflow: hidden;
              padding: 4px 0;
            }

            .title-line.has-desc {
              align-items: center;
            }

            .title-desc {
              font-family: var(--font);
              font-weight: 400;
              font-size: clamp(12px, 0.95vw, 14.5px);
              line-height: 1.4;
              color: var(--text-2);
              max-width: 32ch;
              letter-spacing: 0;
              text-transform: none;
              margin: 0;
              align-self: center;
            }

            .paren-group {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              font-family: var(--font);
              line-height: 0.94;
            }

            .paren-group .paren {
              color: var(--text);
              display: inline-block;
              transform: translateY(-2%);
              font-weight: 400;
            }

            .avatar-group {
              display: flex;
              align-items: center;
            }

            .avatar-group img {
              width: 42px;
              height: 42px;
              border-radius: 50%;
              border: 2px solid white;
              margin-left: -15px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
              object-fit: cover;
              background: #fff;
            }

            .avatar-group img:first-child {
              margin-left: 0;
            }

            /* Icon tile */
            .icon-tile {
              width: 52px;
              height: 52px;
              border-radius: 100px;
              background: var(--tile);
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #fafaf7;
              box-shadow: 0 24px 40px -16px rgba(0, 0, 0, 0.5),
                0 10px 20px -6px rgba(0, 0, 0, 0.32), 0 3px 6px -1px rgba(0, 0, 0, 0.18),
                inset 0 2px 0 rgba(255, 255, 255, 0.12), inset 0 -3px 6px rgba(0, 0, 0, 0.5);
              cursor: pointer;
              z-index: 10;
              position: relative;
              transition: box-shadow 0.5s cubic-bezier(0.6, 0, 0.2, 1);
            }

            .icon-tile::after {
              content: "";
              position: absolute;
              inset: 0;
              background: linear-gradient(
                155deg,
                rgba(255, 255, 255, 0.12) 0%,
                transparent 35%,
                transparent 70%,
                rgba(0, 0, 0, 0.3) 100%
              );
              pointer-events: none;
              border-radius: inherit;
            }

            .hero-desc-right {
              width: fit-content;
              text-align: left;
              font-size: 0.9rem;
              color: var(--text);
              font-weight: 500;
              letter-spacing: normal;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }

            .future-tag {
              font-family: var(--font);
              font-weight: 500;
              font-size: clamp(11px, 0.9vw, 13px);
              line-height: 1.35;
              color: var(--text-2);
              align-self: center;
              margin-left: 6px;
            }

            /* CIRCULAR BADGE */
            .badge {
              position: absolute;
              left: 16px;
              top: 240px;
              width: 104px;
              height: 104px;
              z-index: 6;
              margin-block-start: 2rem;
              cursor: pointer;
            }

            .badge .ring {
              position: absolute;
              inset: 0;
              animation: spin 18s linear infinite;
            }

            .badge:hover .ring {
              animation-duration: 6s;
            }

            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }

            .badge-center {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: var(--card);
              border: 1px solid var(--line-2);
              display: grid;
              place-items: center;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08), inset 0 1px 0 white;
            }

            .badge-center svg {
              width: 15px;
              height: 15px;
              color: var(--text);
            }

            /* ─── RESOURCE LIST ─── */
            .resource-list {
              position: relative;
              z-index: 4;
              margin: 70px 0 30px;
              margin-left: auto;
              max-width: 380px;
            }

            .res-item {
              display: grid;
              grid-template-columns: 1fr auto auto;
              align-items: center;
              gap: 18px;
              padding: 14px 6px;
              border-top: 1px solid var(--line-2);
              color: var(--mute);
              font-size: 15px;
              transition: color 0.25s, padding 0.25s;
              cursor: pointer;
              text-decoration: none;
            }

            .res-item:last-child {
              border-bottom: 1px solid var(--line-2);
            }

            .res-item:hover {
              color: var(--text);
              padding-left: 10px;
            }

            .res-item .label {
              display: inline-flex;
              gap: 6px;
            }

            .res-item.active {
              color: var(--text);
              font-weight: 600;
            }

            .res-item .dots {
              display: inline-flex;
              gap: 4px;
            }

            .res-item .dots span {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: currentColor;
              opacity: 0.25;
            }

            .res-item.active .dots span:nth-child(2) {
              opacity: 1;
              background: #4f46e5;
            }

            .res-item .arrow svg {
              width: 18px;
              height: 18px;
              transition: transform 0.3s;
            }

            .res-item:hover .arrow svg {
              transform: translateX(4px);
            }

            /* ─── BOTTOM CARDS ─── */
            .bottom {
              position: relative;
              z-index: 5;
              display: grid;
              grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
              gap: 28px;
              margin: 30px 0 40px;
              align-items: end;
            }

            /* Clay card base */
            .clay-card {
              background: var(--card);
              border-radius: 24px;
              border: 1px solid var(--line);
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9),
                0 1px 4px rgba(0, 0, 0, 0.03), 0 12px 36px rgba(20, 40, 80, 0.07),
                0 30px 60px rgba(20, 40, 80, 0.04);
              transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s;
            }

            .clay-card:hover {
              transform: translateY(-4px);
              box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9),
                0 1px 4px rgba(0, 0, 0, 0.04), 0 18px 50px rgba(20, 40, 80, 0.1),
                0 40px 80px rgba(20, 40, 80, 0.06);
            }

            /* LEFT cluster: team card + research/analysis grid */
            .doctor-cluster {
              display: flex;
              flex-direction: column;
              gap: 14px;
              max-width: 480px;
            }

            .doctor-card {
              padding: 16px 18px;
              display: flex;
              align-items: center;
              gap: 14px;
            }

            .doctor-avatar {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              overflow: hidden;
              flex-shrink: 0;
              background: linear-gradient(135deg, #4f46e5, #6366f1);
              box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3), 0 4px 12px rgba(99, 102, 241, 0.3);
              display: grid;
              place-items: center;
              color: white;
            }

            .doctor-meta {
              flex: 1;
              line-height: 1.25;
            }

            .doctor-meta .name {
              font-weight: 700;
              font-size: 15px;
              color: var(--text);
            }

            .doctor-meta .role {
              font-size: 12.5px;
              color: var(--mute);
              margin-top: 3px;
            }

            .search-btn {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              border: 1px solid var(--line-2);
              background: var(--card-soft);
              display: grid;
              place-items: center;
              transition: background 0.25s, transform 0.25s;
              cursor: pointer;
            }

            .search-btn:hover {
              background: var(--text);
              color: white;
              transform: rotate(-8deg);
            }

            .search-btn svg {
              width: 16px;
              height: 16px;
            }

            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 14px;
            }

            .info-card {
              padding: 18px;
              min-height: 140px;
            }

            .info-card .ic-head {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              font-weight: 700;
              color: var(--text);
              padding: 6px 12px;
              border-radius: 999px;
              border: 1px solid var(--line-2);
              background: var(--card-soft);
              margin-bottom: 12px;
            }

            .info-card .ic-head svg {
              width: 14px;
              height: 14px;
              color: #4f46e5;
            }

            .info-card p {
              font-size: 13px;
              line-height: 1.45;
              color: var(--mute);
              margin: 0;
            }

            /* RIGHT cluster: 2 treatment cards */
            .treatments {
              display: flex;
              flex-direction: column;
              gap: 14px;
              margin-left: auto;
              max-width: 460px;
              width: 100%;
            }

            .treatment {
              padding: 20px 22px;
            }

            .treatment .head {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 8px;
            }

            .treatment .icon {
              width: 38px;
              height: 38px;
              border-radius: 12px;
              background: #eef2ff;
              border: 1px solid #c7d2fe;
              display: grid;
              place-items: center;
              color: #4f46e5;
              box-shadow: inset 0 1px 0 white;
            }

            .treatment .icon svg {
              width: 18px;
              height: 18px;
            }

            .treatment h3 {
              flex: 1;
              font-family: "Inter Tight", sans-serif;
              font-size: 17px;
              font-weight: 700;
              letter-spacing: -0.01em;
              margin: 0;
              color: var(--text);
            }

            .menu-dots {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: transparent;
              display: grid;
              place-items: center;
              color: var(--mute);
              transition: background 0.25s;
              cursor: pointer;
            }

            .menu-dots:hover {
              background: var(--bg-2);
              color: var(--text);
            }

            .treatment p {
              font-size: 13.5px;
              line-height: 1.5;
              color: var(--mute);
              margin: 0 0 14px;
            }

            .tag-row {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }

            .tag {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 5px 12px;
              border-radius: 999px;
              background: var(--card-soft);
              border: 1px solid var(--line-2);
              font-size: 12px;
              color: var(--text-2);
              font-weight: 500;
            }

            .tag svg {
              width: 13px;
              height: 13px;
              color: var(--mute);
            }

            /* ─── FOOTER ROW ─── */
            .footer-row {
              position: relative;
              z-index: 6;
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              align-items: center;
              margin-top: 20px;
            }

            .social {
              display: inline-flex;
              gap: 10px;
            }

            .social-btn {
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: var(--card);
              border: 1px solid var(--line);
              display: grid;
              place-items: center;
              color: var(--text);
              box-shadow: 0 1px 0 white inset, 0 4px 12px rgba(0, 0, 0, 0.05);
              transition: transform 0.3s, background 0.3s, color 0.3s;
              cursor: pointer;
              text-decoration: none;
            }

            .social-btn:hover {
              background: var(--text);
              color: white;
              transform: translateY(-3px) scale(1.05);
            }

            .social-btn svg {
              width: 16px;
              height: 16px;
            }

            .discover {
              justify-self: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6px;
              color: var(--text-2);
              font-size: 13.5px;
              cursor: pointer;
              text-decoration: none;
            }

            .discover .arrow-down {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: var(--card);
              border: 1px solid var(--line);
              display: grid;
              place-items: center;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              animation: bounce 1.8s ease-in-out infinite;
            }

            .discover .arrow-down svg {
              width: 14px;
              height: 14px;
            }

            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(6px); }
            }

            /* ─── LOGO TICKER & ABOUT ENGINE SECTIONS ─── */
            .ls {
              overflow: hidden;
              padding: 24px 0;
              background: #f8fafc;
              border-top: 1px solid #e9eef5;
              border-bottom: 1px solid #e9eef5;
              position: relative;
              margin-top: 40px;
            }
            .ls::before, .ls::after {
              content: '';
              position: absolute;
              top: 0;
              bottom: 0;
              width: clamp(40px, 10vw, 120px);
              z-index: 2;
              pointer-events: none;
            }
            .ls::before { left: 0; background: linear-gradient(90deg, #f8fafc, transparent); }
            .ls::after { right: 0; background: linear-gradient(-90deg, #f8fafc, transparent); }
            .ls-track {
              display: flex;
              align-items: center;
              width: max-content;
              animation: ls-scroll 40s linear infinite;
            }
            .ls-track.paused { animation-play-state: paused; }
            @keyframes ls-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .ls-item {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0 38px;
              height: 54px;
              flex-shrink: 0;
            }
            .ls-item img {
              height: 38px;
              width: auto;
              max-width: 120px;
              object-fit: contain;
              filter: grayscale(100%) opacity(0.55);
              transition: all .3s;
            }
            .ls-item:hover img {
              filter: grayscale(0%) opacity(1);
              transform: scale(1.08);
            }

            .arch-wrapper { padding: 40px clamp(20px, 3vw, 40px) 60px; max-width: 1280px; margin: 0 auto; width: 100%; }
            .wa { padding: 80px 40px; max-width: 1280px; margin: 0 auto; }
            .wa-header { text-align: center; margin-bottom: 48px; }
            .wa-chip {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              background: #eef2ff;
              border: 1px solid #c7d2fe;
              border-radius: 999px;
              padding: 5px 14px;
              font-size: 11px;
              font-weight: 700;
              color: #4f46e5;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-bottom: 16px;
            }
            .wa-h2 {
              font-family: 'Inter Tight', var(--font);
              font-size: clamp(28px, 3.2vw, 46px);
              font-weight: 900;
              color: #0f172a;
              line-height: 1.12;
              letter-spacing: -1.2px;
              margin: 0 0 12px;
            }
            .wa-h2 .emp {
              background: linear-gradient(90deg, #4f46e5, #6366f1);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .wa-desc { font-size: 14.5px; color: #64748b; line-height: 1.8; max-width: 620px; margin: 0 auto; }

            .fg { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-top: 40px; }
            @media(max-width:900px){ .fg { grid-template-columns: 1fr 1fr; } }
            @media(max-width:600px){ .fg { grid-template-columns: 1fr; } }
            .fc {
              padding: 26px;
              border-radius: 20px;
              border: 1.5px solid #e9eef5;
              background: #fff;
              transition: all .25s;
            }
            .fc:hover {
              transform: translateY(-3px);
              box-shadow: 0 14px 36px rgba(0,0,0,0.06);
              border-color: #c7d2fe;
            }
            .fc-icon {
              width: 44px;
              height: 44px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 16px;
            }
            .fc-h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
            .fc-p { font-size: 13px; color: #64748b; line-height: 1.65; margin: 0; }
            .fc-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
            .fc-tag { font-size: 10.5px; font-weight: 600; padding: 3px 9px; border-radius: 6px; background: #f1f5f9; color: #475569; }

            .providers { padding: 48px 40px 60px; max-width: 1280px; margin: 0 auto; text-align: center; }
            .prov-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 22px; }
            .prov-chip {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 8px 16px;
              border-radius: 10px;
              font-size: 13px;
              font-weight: 600;
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              color: #475569;
            }
            .prov-chip.ok { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }
            .prov-chip.free { background: #eef2ff; border-color: #c7d2fe; color: #4f46e5; }

            .wf { background: #0f172a; padding: 28px 40px; display: flex; align-items: center; justify-content: space-between; }
            .wf-l { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 15px; color: #fff; }
            .wf-r { font-size: 12.5px; color: #64748b; }

            /* ─── RESPONSIVE ─── */
            @media (max-width: 1100px) {
              .header-cta .cta-arrows { display: none; }
              .nav-pill { padding: 8px 14px; font-size: 13.5px; }
              .badge { left: 8px; top: 200px; transform: scale(0.9); }
            }

            @media (max-width: 900px) {
              .nav-pills { display: none; }
              .resource-list { margin-left: 0; max-width: 100%; }
              .bottom { grid-template-columns: 1fr; }
              .doctor-cluster, .treatments { margin: 0 auto; max-width: 500px; }
              .footer-row { grid-template-columns: 1fr; gap: 18px; justify-items: center; }
              .badge { position: relative; left: auto; top: auto; margin: 18px 0; }
              .bg-text { font-size: clamp(90px, 24vw, 180px); }
              .wave-wrap { right: -250px; opacity: 0.85; }
              .wa { padding: 48px 20px; }
            }

            @media (max-width: 540px) {
              .page { padding: 16px 16px 40px; }
              .title { font-size: clamp(34px, 11vw, 56px); }
              .paren-group { font-size: clamp(34px, 11vw, 56px); }
              .header { padding: 8px 10px; gap: 10px; }
              .logo .logo-text { display: none; }
              .cta-text { display: none; }
              .header-cta { padding: 6px; }
              .hero { padding: 32px 0 20px; }
              .badge { width: 80px; height: 80px; margin: 10px 0; }
              .badge-center { width: 26px; height: 26px; }
              .badge-center svg { width: 12px; height: 12px; }
              .info-grid { grid-template-columns: 1fr; }
              .ls-item { padding: 0 20px; }
              .ls-item img { height: 28px; max-width: 80px; }
              .wf { flex-direction: column; gap: 12px; text-align: center; }
            }
          `}</style>

          <div className="page">

            {/* ─── WAVE VISUAL + ATMOSPHERIC GLOW ─── */}
            <div className="wave-glow"></div>
            <div className="wave-glow b"></div>
            <div className="wave-wrap" id="wave">
              <img
                src="https://cdn.shopify.com/s/files/1/0185/5999/1872/files/blue_strand_transparent.png?v=1778949964"
                alt="Flowing blue data ribbon"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>

            {/* ─── BACKGROUND GIANT TEXT ─── */}
            <div className="bg-text" aria-hidden="true">
              DIGITAL&nbsp;TRADE
            </div>

            {/* ─── HEADER ─── */}
            <header className="header" role="banner">
              <div className="logo" onClick={handleEnter} aria-label="RDTII 2.1 Engine home">
                <div className="logo-mark" aria-hidden="true">
                  <Bolt size={18} />
                </div>
                <div className="logo-text">
                  <span className="a">RDTII 2.1</span>
                  <span className="b">Compliance Engine</span>
                </div>
              </div>

              <nav className="nav-pills" aria-label="Primary">
                <span className="nav-pill active" onClick={() => scrollToSection('top')}>
                  <Globe size={15} />
                  Overview
                </span>
                <span className="nav-pill" onClick={() => scrollToSection('about')}>
                  <Layers size={15} />
                  Pillars & Indicators
                </span>
                <span className="nav-pill" onClick={() => scrollToSection('architecture')}>
                  <Brain size={15} />
                  Pipeline Architecture
                </span>
                <span className="nav-pill" onClick={() => scrollToSection('providers')}>
                  <Shield size={15} />
                  8 LLMs
                </span>
              </nav>

              <button className="header-cta" onClick={handleEnter} aria-label="Launch Dashboard">
                <span className="cta-text">Launch Engine</span>
                <span className="cta-dot">
                  <ArrowUpRight size={15} />
                </span>
                <span className="cta-arrows" aria-hidden="true">
                  <ChevronRight size={14} />
                  <ChevronRight size={14} />
                </span>
              </button>
            </header>

            {/* ─── HERO ─── */}
            <section className="hero" id="top">
              <span className="eyebrow">UNESCAP Global Hackathon 2026 &middot; Team SUPERNOVA</span>

              <h1 className="title">
                <div className="title-line title-line-1">
                  <span className="word">AI-POWERED TRADE:</span>
                </div>

                <div className="title-line has-desc">
                  <p className="title-desc">
                    Automating the UN Regional Digital Trade Integration Index (RDTII) 2.1 pipeline with multi-agent AI
                  </p>
                  <span className="paren-group">
                    <span className="paren">(</span>
                    <span className="avatar-group" aria-hidden="true">
                      <img src="/assets/swipelogo/ESCAP_Secondary_Logo_Blue.png" alt="UNESCAP" />
                      <img src="/assets/swipelogo/UNCTAD_Master_Logo_Blue.png" alt="UNCTAD" />
                      <img src="/assets/swipelogo/worldbankv2-01.jpg" alt="World Bank" />
                    </span>
                    <span className="icon-tile dna-icon" onClick={handleEnter} title="Launch Engine">
                      <Bolt size={26} color="#ffffff" />
                    </span>
                    <span className="paren">)</span>
                  </span>
                  <span className="word">REDEFINING</span>
                </div>

                <div className="title-line">
                  <span className="word">COMPLIANCE</span>
                  <span className="future-tag">
                    <span className="hero-desc-right">
                      <i className="ph-fill ph-arrow-circle-right"></i> The future is now — <strong>unlock multi-agent ai</strong>
                    </span>
                  </span>
                </div>
              </h1>

              {/* Circular spinning badge */}
              <div className="badge" onClick={handleEnter} aria-hidden="true" title="Click to Launch Dashboard">
                <svg className="ring" viewBox="0 0 100 100">
                  <defs>
                    <path id="badge-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" fill="none" />
                  </defs>
                  <text font-family="Inter Tight, sans-serif" font-size="9.5" font-weight="600" fill="#2b2b30" letter-spacing="2.4">
                    <textPath href="#badge-path">RDTII 2.1 · UNESCAP · MULTI-AGENT · </textPath>
                  </text>
                </svg>
                <span className="badge-center">
                  <ArrowUpRight size={15} />
                </span>
              </div>
            </section>

            {/* ─── RESOURCE LIST ─── */}
            <nav className="resource-list" aria-label="Sections">
              <div
                className={`res-item ${activeResIndex === 1 ? 'active' : ''}`}
                onClick={() => { setActiveResIndex(1); scrollToSection('about'); }}
              >
                <span className="label">Evidence Discovery <span style={{ color: 'var(--mute-2)' }}>/&nbsp;01</span></span>
                <span className="dots"><span></span><span></span><span></span></span>
                <span className="arrow"><ChevronRight size={18} /></span>
              </div>
              <div
                className={`res-item ${activeResIndex === 2 ? 'active' : ''}`}
                onClick={() => { setActiveResIndex(2); scrollToSection('architecture'); }}
              >
                <span className="label">Adversarial Pipeline <span style={{ color: 'var(--mute-2)' }}>/&nbsp;02</span></span>
                <span className="dots"><span></span><span></span><span></span></span>
                <span className="arrow"><ChevronRight size={18} /></span>
              </div>
              <div
                className={`res-item ${activeResIndex === 3 ? 'active' : ''}`}
                onClick={() => { setActiveResIndex(3); scrollToSection('providers'); }}
              >
                <span className="label">Persistence & Export <span style={{ color: 'var(--mute-2)' }}>/&nbsp;03</span></span>
                <span className="dots"><span></span><span></span><span></span></span>
                <span className="arrow"><ChevronRight size={18} /></span>
              </div>
            </nav>

            {/* ─── BOTTOM CARDS ─── */}
            <section className="bottom">
              <div className="doctor-cluster">
                <div className="clay-card doctor-card">
                  <div className="doctor-avatar" aria-hidden="true">
                    <Bolt size={24} />
                  </div>
                  <div className="doctor-meta">
                    <div className="name">Team SUPERNOVA</div>
                    <div className="role">UNESCAP Hackathon 2026</div>
                  </div>
                  <button className="search-btn" onClick={handleEnter} aria-label="Start Analysis">
                    <Search size={16} />
                  </button>
                </div>
                <div className="info-grid">
                  <div className="clay-card info-card">
                    <span className="ic-head">
                      <FileText size={14} />
                      61+ Indicators
                    </span>
                    <p>Comprehensive coverage across 12 UN Digital Trade Pillars</p>
                  </div>
                  <div className="clay-card info-card">
                    <span className="ic-head">
                      <Globe size={14} />
                      Legal Portals
                    </span>
                    <p>Crawling sso.agc.gov.sg, agc.gov.my, legislation.gov.au</p>
                  </div>
                </div>
              </div>

              <div className="treatments">
                <article className="clay-card treatment">
                  <div className="head">
                    <span className="icon" aria-hidden="true">
                      <Brain size={18} />
                    </span>
                    <h3>Adversarial AI Pipeline</h3>
                    <button className="menu-dots" onClick={handleEnter} aria-label="Launch Engine">
                      <Play size={14} />
                    </button>
                  </div>
                  <p>Prosecution, Defense & Arbiter LLMs evaluate evidence with quote grounding & fuzzy matching</p>
                  <div className="tag-row">
                    <span className="tag">
                      <Shield size={13} />
                      Zero-Hallucination
                    </span>
                    <span className="tag">
                      <CheckCircle2 size={13} />
                      Quote Grounded
                    </span>
                  </div>
                </article>

                <article className="clay-card treatment">
                  <div className="head">
                    <span className="icon" aria-hidden="true">
                      <Layers size={18} />
                    </span>
                    <h3>Official UN Submissions</h3>
                    <button className="menu-dots" onClick={handleEnter} aria-label="Launch Engine">
                      <Play size={14} />
                    </button>
                  </div>
                  <p>Automated export to multi-sheet Excel, JSON, and CSV in official UNESCAP template formats</p>
                  <div className="tag-row">
                    <span className="tag">
                      <FileText size={13} />
                      UN Excel Format
                    </span>
                  </div>
                </article>
              </div>
            </section>

            {/* ─── FOOTER ROW ─── */}
            <div className="footer-row">
              <div className="social">
                <a href="#architecture" className="social-btn" aria-label="Architecture">
                  <Brain size={16} />
                </a>
                <a href="#providers" className="social-btn" aria-label="LLM Providers">
                  <Shield size={16} />
                </a>
                <a href="#about" className="social-btn" aria-label="About">
                  <Globe size={16} />
                </a>
              </div>

              <a href="#about" className="discover">
                Discover architecture
                <span className="arrow-down">
                  <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
                </span>
              </a>

              <div></div>
            </div>

          </div>

          {/* ─── PARTNER LOGO TICKER ─── */}
          <div
            className="ls"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className={`ls-track${paused ? " paused" : ""}`}>
              {doubledLogos.map((logo, i) => (
                <div key={i} className="ls-item" title={logo.name}>
                  <img src={logo.src} alt={logo.name} loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          {/* ─── ABOUT THE ENGINE ─── */}
          <div id="about" className="wa">
            <div className="wa-header">
              <div className="wa-chip">
                <Bolt size={12} />
                Engine Architecture
              </div>
              <h2 className="wa-h2">
                Three modules. One <span className="emp">end-to-end pipeline</span>.
              </h2>
              <p className="wa-desc">
                The RDTII 2.1 Compliance Engine automates the entire regulatory analysis workflow —
                crawling official government portals, running a multi-agent adversarial LLM consensus,
                and exporting scores directly in official UN template formats.
              </p>
            </div>

            <div className="fg">
              {[
                {
                  icon: Globe,
                  color: "#4f46e5",
                  bg: "#eef2ff",
                  title: "Automated Evidence Discovery",
                  desc: "Crawls official legal portals (sso.agc.gov.sg, agc.gov.my, legislation.gov.au), retrieves legislation via multi-engine PDF extraction + OCR, and extracts structured text with language detection.",
                  tags: ["Tavily API", "Playwright", "Tesseract OCR", "4 PDF Engines"]
                },
                {
                  icon: Brain,
                  color: "#059669",
                  bg: "#ecfdf5",
                  title: "Multi-Agent Adversarial Pipeline",
                  desc: "3-agent LLM consensus (Prosecution → Defense → Arbiter) per RDTII indicator. Hallucination defense with quote grounding, fuzzy matching, and citation verification.",
                  tags: ["RAG Engine", "ChromaDB", "bge-base-en-v1.5", "8 LLM Providers"]
                },
                {
                  icon: Layers,
                  color: "#d97706",
                  bg: "#fffbeb",
                  title: "Persistence & UN Export",
                  desc: "Scores persisted in PostgreSQL and exported as JSON, CSV (3 variants), or Excel (3 sheets) in official RDTII template format — ready for UN submission.",
                  tags: ["PostgreSQL", "JSON", "CSV", "Official Excel"]
                },
              ].map((card) => (
                <div key={card.title} className="fc">
                  <div className="fc-icon" style={{ background: card.bg }}>
                    <card.icon style={{ width: 22, height: 22, color: card.color }} />
                  </div>
                  <h3 className="fc-h3">{card.title}</h3>
                  <p className="fc-p">{card.desc}</p>
                  <div className="fc-tags">
                    {card.tags.map(t => <span key={t} className="fc-tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── PIPELINE ARCHITECTURE COMPONENT ─── */}
          <div id="architecture" className="arch-wrapper">
            <PipelineArchitecture />
          </div>

          {/* ─── LLM PROVIDERS ─── */}
          <div id="providers" className="providers">
            <div>
              <div className="wa-chip" style={{ justifyContent: "center", width: "fit-content", margin: "0 auto 16px" }}>
                <Shield size={12} />
                8 LLM Providers — Automatic Fallback
              </div>
              <p style={{ fontSize: 13.5, color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                Provider abstraction layer with instant fallback chain. Guaranteed zero downtime during API rate limits or quota drops.
              </p>
              <div className="prov-grid">
                {[
                  { name: "Gemini 2.5 Flash", ok: true },
                  { name: "OpenAI GPT-4o", ok: true },
                  { name: "Grok (xAI)", ok: true },
                  { name: "DeepSeek V3", ok: true },
                  { name: "MiniMax-M3", free: true },
                  { name: "Nvidia Nemotron", free: true },
                  { name: "Ollama Local", ok: true },
                  { name: "TokenRouter", ok: true },
                ].map(p => (
                  <span key={p.name} className={`prov-chip ${p.free ? 'free' : p.ok ? 'ok' : ''}`}>
                    {p.free ? <Bolt size={12} /> : <Shield size={12} />}
                    {p.name}
                    {p.free && <span style={{ fontSize: 9, background: "rgba(99,102,241,0.12)", padding: "1px 5px", borderRadius: 4, marginLeft: 3 }}>FREE</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─── FOOTER ─── */}
          <footer className="wf">
            <div className="wf-l">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#4f46e5,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bolt size={15} color="#fff" />
              </div>
              RDTII <span style={{ color: "#818cf8" }}>2.1</span> Engine
            </div>
            <div className="wf-r">
              RDTII 2.1 Compliance Engine &middot; Team SUPERNOVA &middot; UNESCAP Global Hackathon 2026
            </div>
          </footer>

        </motion.div>
      )}
    </AnimatePresence>
  );
}