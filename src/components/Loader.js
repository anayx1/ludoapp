import dynamic from "next/dynamic";

const Loader = dynamic(() => import("@/components/Loader"), {
  ssr: false,
});

export default Loader;