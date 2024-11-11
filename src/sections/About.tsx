"use client"
import { SectionHeader } from "@/components/SectionHeadaer";
import { Card } from "@/components/Card";
import bookImage from '@/assets/images/book-cover.png';
import Image from "next/image";
import JavaScriptIcon from '@/assets/icons/square-js.svg';
import HTMLIcon from '@/assets/icons/html5.svg';
import CSSIcon from '@/assets/icons/css3.svg';
import ReactIcon from '@/assets/icons/react.svg';
import GithubIcon from '@/assets/icons/github.svg';
import TailwindIcon from '@/assets/icons/tailwinds.svg';
import LaravelIcon from '@/assets/icons/laravel.svg';
import mapImage from '@/assets/images/map.png';
import smileMemoji from '@/assets/images/memoji-smile.png';
import { CardHeader } from "@/components/CardHeader";
import { ToolboxItem } from "@/components/ToolboxItems";
import { motion } from "framer-motion";
import { useRef } from "react";

const toolboxItems = [
  {
    title: 'JavaScript',
    iconType: JavaScriptIcon,
  },
  {
    title: 'HTML5',
    iconType: HTMLIcon,
  },
  {
    title: 'CSS3',
    iconType: CSSIcon,
  },
  {
    title: 'Tailwinds',
    iconType: TailwindIcon,
  },
  {
    title: 'React',
    iconType: ReactIcon,
  },
  {
    title: 'Github',
    iconType: GithubIcon,
  },
  {
    title: 'Laravel',
    iconType: LaravelIcon,
  },
];

const hobbies = [
  {
    title: 'Gaming',
    emoji: '🎮',
    left: '5%',
    top: '5%',
  },
  {
    title: 'Photography',
    emoji: '📷',
    left: '60%',
    top: '5%',
  },
  {
    title: 'Music',
    emoji: '🎵',
    left: '14%',
    top: '17%',
  },
  {
    title: 'Movies',
    emoji: '🍿',
    left: '44%',
    top: '16%',
  },
  {
    title: 'Sports',
    emoji: '👟',
    left: '68%',
    top: '36%',
  },
  {
    title: 'Reading',
    emoji: '📚',
    left: '5%',
    top: '30%',
  },
  {
    title: 'Travel',
    emoji: '🧳',
    left: '32%',
    top: '26%',
  },
];

export const AboutSection = () => {
  const constraintRef = useRef(null);
  return (
    <div className="py-20 lg:py-28">
      <div className="container">
        <SectionHeader eyebrow="About Me"
          title="A Glimpse Into My World"
          description="Learn more about who I am, what I do, and what inspires me." />
        <div className="mt-20 flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5 lg:grid-cols-3">
            <Card className="h-[320px] md:col-span-2 lg:col-span-1">
              <CardHeader title="My Reads" description="Explore the books shaping in my perspectives."
              />
              <div className="w-40 mx-auto m-2 md:mt-0">
                <Image src={bookImage} alt="Book cover" />
              </div>
            </Card>
            <Card className="h-[320px] md:col-span-3 lg:col-span-2">
              <CardHeader title="My Toolbox" description="Explore the technologies and tools I use to craft exceptional digital experience." />
              <ToolboxItem items={toolboxItems} className="" itemsWrapperClassName="animate-move-left [animation-duration:30s]"/>
              <ToolboxItem items={toolboxItems} className="mt-6"
                itemsWrapperClassName="animate-move-right [animation-duration:15s]"
              />
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 lg:col-span-2 gap-8">
            <Card className="h-[320px] p-0 flex-col col-span-3 lg:col-span-2 relative overflow-hidden">
              <CardHeader title="Beyond the Code" description="Explore my interest and hobbies beyond the digital realm." 
              className="px-6 py-6"
              />
              <div className="relative w-full h-full" ref={constraintRef}>
                {hobbies.map(hobby => (
                  <motion.div 
                  key={hobby.title}
                    className="inline-flex items-center gap-2 px-6 bg-gradient-to-r from-emerald-300 to-sky-400 rounded-full py-1.5 absolute"
                    style={{
                      left: hobby.left,
                      top: hobby.top,
                    }}
                    drag
                    dragConstraints={constraintRef}
                  >
                    <span className="font-medium text-gray-950">{hobby.title}</span>
                    <span>{hobby.emoji}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
            <Card className="h-[320px] p-0 relative col-span-2 lg:col-span-1">
              <Image src={mapImage} alt="map" className="h-full w-full object-cover object-left-top" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-full after:content-[''] after:absolute after:inset-0 after:outline after:outline-2 after:-outline-offset-2 after:rounded-full after:outline-bg-gray-950/30">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-300 to-sky-400 -z-20 animate-ping [animation-duration:2s]"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-300 to-sky-400 -z-10"></div>
                <Image src={smileMemoji} alt="smile memoji" className="size-18"/>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
