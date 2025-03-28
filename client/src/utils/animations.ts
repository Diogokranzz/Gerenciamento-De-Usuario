import { Variants } from "framer-motion";

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// For staggered items in a list
export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Fade in variants
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// Scale up variants
export const scaleUp: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// Card hover animation for 3D effect
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    rotateX: 0,
  },
  hover: {
    scale: 1.02,
    y: -5,
    rotateX: 5,
    transition: {
      duration: 0.3,
    },
  },
};

// Button hover animation
export const buttonHover = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Sidebar item hover
export const sidebarItemHover = {
  rest: {
    x: 0,
  },
  hover: {
    x: 5,
    transition: {
      duration: 0.2,
    },
  },
};

// Chart bar animation
export const chartBarAnimation = (delay: number = 0) => ({
  initial: {
    height: 0,
  },
  animate: {
    height: "100%",
    transition: {
      duration: 1,
      delay: delay * 0.1,
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
});
