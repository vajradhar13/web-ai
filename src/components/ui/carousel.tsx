import Image from "next/image";
import Link from "next/link";

interface Slide {
  title: string;
  button: string;
  src: string;
  path: string;
}

export default function Carousel({ slides }: { slides: Slide[] }) {
  return (
    <div className="flex justify-center items-center w-full h-full min-h-[350px] py-4">
      <div className="flex gap-12">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="min-w-[320px] max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col items-center transition-transform hover:scale-105"
          >
            <div className="w-48 h-48 relative mb-6">
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                className="object-contain rounded"
              />
            </div>
            <h4 className="font-bold text-2xl mb-4 text-center">{slide.title}</h4>
            <Link href={slide.path} className="mt-auto">
              <button className="px-6 py-3 bg-primary text-white rounded-lg text-lg hover:bg-primary/90 transition">
                {slide.button}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
} 