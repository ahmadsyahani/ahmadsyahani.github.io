import memojiImage from '@/assets/images/memoji-computer.png'
import Image from 'next/image';
import ArrowDown from '@/assets/icons/arrow-down.svg';
import grainImage from '@/assets/images/grain.jpg';
import StarIcon from '@/assets/icons/star.svg';
import { HeroOrbit } from '@/components/HeroOrbit';
import SparkleIcon from '@/assets/icons/sparkle.svg';

export const HeroSection = () => {
    return (
        <div id="home">
        <div className="py-32 md:py-48 lg:py-60 relative z-0 overflow-x-clip">
            <div className='absolute inset-0 [mask-image: linear-gradient(to_bottom,transparent,black_10%,black_70%,trasnparent)]'>
                <div
                    className='absolute inset-0 -z-30 opacity-5'
                    style={{
                        backgroundImage: `url(${grainImage.src})`
                    }}></div>
                <div className='size-[675px] hero-ring'></div>
                <div className='size-[880px] hero-ring'></div>
                <div className='size-[1080px] hero-ring'></div>
                <div className='size-[1280px] hero-ring'></div>
                {/*
                shouldOrbit?: boolean;
                shouldSpin?: boolean;
                spinDuration?: string;
                orbitDuration?: string;
                */}
                <HeroOrbit size={430} rotation={-55} shouldOrbit orbitDuration='30s'>
                    <SparkleIcon className="size-8 text-emerald-300/20" />
                </HeroOrbit>
                <HeroOrbit size={440} rotation={-90} shouldOrbit orbitDuration='32s'>
                    <SparkleIcon className="size-14 text-emerald-300/20" />
                </HeroOrbit>
                <HeroOrbit size={510} rotation={-45} shouldOrbit orbitDuration='34s'>
                    <div className="size-2 rounded-full text-emerald-300/20" />
                </HeroOrbit>
                <HeroOrbit size={550} rotation={20} shouldOrbit orbitDuration='36s'>
                    <StarIcon className="size-14 text-emerald-300" />
                </HeroOrbit>
                <HeroOrbit size={550} rotation={180} shouldOrbit orbitDuration='38s'>
                    <SparkleIcon className="size-10 text-emerald-300/20" />
                </HeroOrbit>
                <HeroOrbit size={590} rotation={86} shouldOrbit orbitDuration='40s'>
                    <StarIcon className="size-9 text-emerald-300" />
                </HeroOrbit>
                <HeroOrbit size={600} rotation={130} shouldOrbit orbitDuration='48s'>
                    <StarIcon className="size-20 text-emerald-300" />
                </HeroOrbit>
                <HeroOrbit size={710} rotation={150} shouldOrbit orbitDuration='42s'>
                    <SparkleIcon className="size-14 text-emerald-300/20" />
                </HeroOrbit>
                <HeroOrbit size={720} rotation={90} shouldOrbit orbitDuration='44s'>
                    <div className="size-14 rounded-full text-emerald-300/20" />
                </HeroOrbit>
                <HeroOrbit size={800} rotation={-76} shouldOrbit orbitDuration='46s' shouldSpin spinDuration='6s'>
                    <StarIcon className="size-28 text-emerald-300" />
                </HeroOrbit>
            </div>
            <div className="container">
                <div className='flex flex-col items-center'>
                    <Image src={memojiImage} className='size-[100px]' alt="Person" />
                    <div
                        className='bg-gray-950 border border-gray-800 px-4 py-1.5 inline-flex items-center gap-4 rounded-lg'>
                        <div className='bg-green-500 size-2.5 rounded-full relative'>
                            <div className="bg-green-500 absolute inset-0 rounded-full animate-ping-large"></div>
                        </div>
                        <div className="text sm font-medium">Available for new projects</div>
                    </div>
                </div>
                <div className='max-w-lg mx-auto'>
                    <h1 className='font-serif text-3xl md:text-5xl text-center mt-8 tracking-wide'>Building Exceptional User Experiences</h1>
                    <p className='mt-4 text-center text-white/60 md:text-lg'>Lorem ipsum dolor sit
                        amet consectetur adipisicing elit. Deserunt nemo temporibus totam, suscipit
                        quasi ducimus consectetur delectus consequuntur sint? Alias nostrum maiores
                        repudiandae ipsum dolore cum blanditiis eaque cumque rem.
                    </p>
                </div>
                <div
                    className='flex flex-col md:flex-row justify-center items-center mt-8 gap-4'>
                    <button
                        className='inline-flex items-center gap-2 border border-white/15 px-6 h-12 rounded-xl '>
                        <span className='font-semibold'>Explore My Work</span>
                        <ArrowDown className="size-4" />
                    </button>
                    <button
                        className='inline-flex items-center gap-2 border border-white bg-white text-gray-900 h-12 px-6 rounded-xl'>
                        <span>👋</span>
                        <span className='font-semibold'>Let's Connect</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};
