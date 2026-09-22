"use client";
import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import HeroPackageBox from './HeroPackageBox.jsx';
import SocialButtons from './SocialButtons.jsx';

export default function Hero({ settings, categories = [], onExploreClick }) {
  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <span className="eyebrow">Grocery, Delivered</span>
        <h1>
          {settings?.header_title ? (
            <span>
              {settings.header_title.split(' ')[0]}{' '}
              <span className="accent">
                {settings.header_title.split(' ').slice(1, 4).join(' ')}
              </span>
              <br />
              {settings.header_title.split(' ').slice(4).join(' ')}
            </span>
          ) : (
            <span>
              মুদি বাজারের <span className="accent">পুরো লিস্ট,</span>
              <br />
              এক জায়গায়।
            </span>
          )}
        </h1>
        <p className="lede">
          {settings?.header_subtitle ||
            'চাল-ডাল থেকে মাছ-মসলা — আড়তের মতো দরে, ঘরে বসে অর্ডার করুন। ব্র্যান্ড বেছে নিন, কার্টে যোগ করুন, ডেলিভারি নিশ্চিত করুন।'}
        </p>
        <motion.button
          className="cta"
          onClick={onExploreClick}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <span>লিস্ট দেখুন</span> <ArrowDown size={15} />
        </motion.button>
      </motion.div>

      {/* Right Column: Hero Package Box + Inline Social Buttons */}
      <div className="hero-right-cluster">
        <HeroPackageBox />
        <SocialButtons variant="inline" />
      </div>
    </motion.section>
  );
}


