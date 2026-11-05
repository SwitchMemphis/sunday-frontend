(function () {
  "use strict";

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }
    callback();
  };

  ready(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const heroArtwork = document.querySelector("[data-sunday-hero-desktop][data-sunday-hero-mobile]");
    if (heroArtwork) {
      const mobileHero = window.matchMedia("(max-width: 600px)");
      const syncHeroArtwork = () => {
        const nextSource = mobileHero.matches
          ? heroArtwork.dataset.sundayHeroMobile
          : heroArtwork.dataset.sundayHeroDesktop;
        if (nextSource && heroArtwork.getAttribute("src") !== nextSource) heroArtwork.src = nextSource;
      };
      syncHeroArtwork();
      mobileHero.addEventListener?.("change", syncHeroArtwork);
    }

    const nav = document.querySelector("[data-sunday-nav]");
    const toggle = document.querySelector("[data-sunday-nav-toggle]");

    if (nav && toggle) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    const faqItems = Array.from(document.querySelectorAll(".sunday-faq details"));
    const animateFaq = (details, open) => {
      const summary = details.querySelector("summary");
      const answer = details.querySelector(".sunday-faq__answer");
      if (!summary || !answer) return;

      if (answer.sundayAnimation) answer.sundayAnimation.cancel();
      summary.setAttribute("aria-expanded", open ? "true" : "false");

      if (reducedMotion.matches || typeof answer.animate !== "function") {
        details.open = open;
        answer.style.removeProperty("height");
        return;
      }

      if (open) {
        details.open = true;
        answer.style.height = "0px";
        const targetHeight = answer.scrollHeight;
        answer.sundayAnimation = answer.animate(
          [{ height: "0px", opacity: 0 }, { height: `${targetHeight}px`, opacity: 1 }],
          { duration: 360, easing: "cubic-bezier(.22, 1, .36, 1)" }
        );
        answer.sundayAnimation.onfinish = () => {
          answer.style.removeProperty("height");
          answer.sundayAnimation = null;
        };
        return;
      }

      answer.style.height = `${answer.offsetHeight}px`;
      answer.sundayAnimation = answer.animate(
        [{ height: `${answer.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }],
        { duration: 280, easing: "cubic-bezier(.4, 0, .2, 1)" }
      );
      answer.sundayAnimation.onfinish = () => {
        details.open = false;
        answer.style.removeProperty("height");
        answer.sundayAnimation = null;
      };
    };

    faqItems.forEach((details) => {
      const summary = details.querySelector("summary");
      if (!summary) return;
      summary.addEventListener("click", (event) => {
        event.preventDefault();
        const willOpen = !details.open;
        if (willOpen) {
          faqItems.forEach((other) => {
            if (other !== details && other.open) animateFaq(other, false);
          });
        }
        animateFaq(details, willOpen);
      });
    });

    const animatedSections = document.querySelectorAll(".sunday-animate-section");
    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      animatedSections.forEach((section) => revealObserver.observe(section));
    } else {
      animatedSections.forEach((section) => section.classList.add("is-visible"));
    }

    const order = document.querySelector("[data-sunday-order]");
    const steps = order ? Array.from(order.querySelectorAll("[data-sunday-step]")) : [];

    if (steps.length) {
      let ticking = false;

      const timeline = order.querySelector(".sunday-story-timeline");

      const setStage = (stage) => {
        const activeIndex = Math.max(0, Math.min(steps.length - 1, stage));
        steps.forEach((step, index) => {
          step.classList.toggle("is-active", index <= activeIndex);
          step.classList.remove("is-complete");
          if (index === activeIndex) step.setAttribute("aria-current", "step");
          else step.removeAttribute("aria-current");
        });
        timeline?.style.setProperty("--sunday-story-progress", `${activeIndex * 50}%`);
      };

      const updateActiveStep = () => {
        ticking = false;
        const activationAdvance = Math.max(72, Math.min(96, window.innerHeight * 0.1));
        const activationLine = (window.innerHeight * 0.5) + activationAdvance;
        const stageSpacing = Math.max(28, Math.min(52, window.innerHeight * 0.055));
        let stage = 0;
        if (steps[1]?.getBoundingClientRect().top <= activationLine + stageSpacing) stage = 1;
        if (steps[2]?.getBoundingClientRect().top <= activationLine - stageSpacing) stage = 2;
        setStage(stage);
      };

      const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateActiveStep);
      };

      steps.forEach((step, index) => {
        ["mouseenter", "focus", "click"].forEach((eventName) => {
          step.addEventListener(eventName, () => setStage(index));
        });
        step.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          setStage(index);
        });
      });

      setStage(0);
      window.requestAnimationFrame(updateActiveStep);
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate, { passive: true });
    }

    const guesswork = document.querySelector("[data-sunday-guesswork]");
    const vial = guesswork ? guesswork.querySelector("[data-sunday-vial]") : null;

    if (guesswork && vial) {
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      const mobile = window.matchMedia("(max-width: 760px)");
      const setCapOpen = (open) => {
        vial.classList.toggle("is-cap-open", open);
        vial.setAttribute("aria-pressed", open ? "true" : "false");
      };
      const syncMobileCap = () => setCapOpen(mobile.matches);

      syncMobileCap();
      if (typeof mobile.addEventListener === "function") {
        mobile.addEventListener("change", syncMobileCap);
      }

      vial.addEventListener("click", () => {
        if (finePointer.matches || mobile.matches) return;
        setCapOpen(!vial.classList.contains("is-cap-open"));
      });

      vial.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (mobile.matches) return;
        setCapOpen(!vial.classList.contains("is-cap-open"));
      });

      document.addEventListener("pointerdown", (event) => {
        if (mobile.matches || !vial.classList.contains("is-cap-open") || vial.contains(event.target)) return;
        setCapOpen(false);
      }, { passive: true });

      if (reducedMotion.matches) {
        guesswork.classList.add("is-motion-ready", "is-in-view");
      } else {
        guesswork.classList.add("is-motion-ready");
        const reveal = () => guesswork.classList.add("is-in-view");
        if ("IntersectionObserver" in window) {
          const researchObserver = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            reveal();
            researchObserver.disconnect();
          }, { rootMargin: "0px 0px -10%", threshold: 0.16 });
          researchObserver.observe(guesswork);
        } else {
          window.requestAnimationFrame(reveal);
        }
      }

      if (!reducedMotion.matches && finePointer.matches) {
        let frame = 0;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        const renderPointer = () => {
          currentX += (targetX - currentX) * 0.115;
          currentY += (targetY - currentY) * 0.115;
          guesswork.style.setProperty("--research-pointer-x", `${currentX * 10}px`);
          guesswork.style.setProperty("--research-pointer-y", `${currentY * 7}px`);
          guesswork.style.setProperty("--research-tilt-x", `${currentY * -2.6}deg`);
          guesswork.style.setProperty("--research-tilt-y", `${currentX * 3.1}deg`);

          if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
            frame = window.requestAnimationFrame(renderPointer);
          } else {
            frame = 0;
          }
        };
        const requestRender = () => {
          if (!frame) frame = window.requestAnimationFrame(renderPointer);
        };

        guesswork.addEventListener("pointermove", (event) => {
          const bounds = guesswork.getBoundingClientRect();
          targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
          targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
          requestRender();
        }, { passive: true });

        guesswork.addEventListener("pointerleave", () => {
          targetX = 0;
          targetY = 0;
          requestRender();
        }, { passive: true });
      }
    }
  });
})();
