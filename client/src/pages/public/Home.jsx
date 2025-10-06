// import { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
// import { 
//   Sparkles, 
//   Users, 
//   Clock, 
//   TrendingUp, 
//   ArrowRight, 
//   ChevronDown,
//   Award,
//   DollarSign,
//   Network,
//   Star,
//   Globe 
// } from 'lucide-react';

// // Enhanced Animated Background with more particles and better effects
// const AnimatedBackground = () => {
//   const particles = Array.from({ length: 30 }, (_, i) => ({
//     id: i,
//     size: Math.random() * 400 + 100,
//     x: Math.random() * 100,
//     y: Math.random() * 100,
//     delay: Math.random() * 8,
//     duration: Math.random() * 20 + 15,
//   }));

//   return (
//     <div className="absolute inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle.id}
//           className="absolute rounded-full opacity-10"
//           style={{
//             width: particle.size,
//             height: particle.size,
//             left: `${particle.x}%`,
//             top: `${particle.y}%`,
//             background: `radial-gradient(circle at center, 
//               rgba(147, 51, 234, 0.2), 
//               rgba(59, 130, 246, 0.1), 
//               rgba(16, 185, 129, 0.05), 
//               transparent)`,
//           }}
//           animate={{
//             x: [0, 40, -30, 20, 0],
//             y: [0, -50, 30, -20, 0],
//             scale: [1, 1.1, 0.9, 1.05, 1],
//             opacity: [0.1, 0.2, 0.05, 0.15, 0.1],
//           }}
//           transition={{
//             duration: particle.duration,
//             repeat: Infinity,
//             delay: particle.delay,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
      
//       {/* Floating orbs */}
//       {Array.from({ length: 8 }).map((_, i) => (
//         <motion.div
//           key={`orb-${i}`}
//           className="absolute w-2 h-2 rounded-full"
//           style={{
//             left: `${Math.random() * 100}%`,
//             top: `${Math.random() * 100}%`,
//             background: `linear-gradient(45deg, 
//               rgba(167, 139, 250, 0.8), 
//               rgba(59, 130, 246, 0.6))`,
//             boxShadow: '0 0 20px rgba(167, 139, 250, 0.4)',
//           }}
//           animate={{
//             y: [0, -100, 0],
//             x: [0, 50, -30, 0],
//             opacity: [0, 1, 0],
//           }}
//           transition={{
//             duration: Math.random() * 10 + 8,
//             repeat: Infinity,
//             delay: Math.random() * 5,
//             ease: "easeInOut",
//           }}
//         />
//       ))}
//     </div>
//   );
// };

// // Enhanced Animated Text with better effects
// const AnimatedText = ({ text, className = "", once = true, delay = 0, gradient = false }) => {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once });
  
//   const letters = Array.from(text);
  
//   const container = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { 
//         staggerChildren: 0.04, 
//         delayChildren: delay,
//       },
//     },
//   };
  
//   const child = {
//     visible: {
//       opacity: 1,
//       y: 0,
//       rotateX: 0,
//       transition: {
//         type: "spring",
//         damping: 15,
//         stiffness: 150,
//       },
//     },
//     hidden: {
//       opacity: 0,
//       y: 30,
//       rotateX: -90,
//       transition: {
//         type: "spring",
//         damping: 15,
//         stiffness: 150,
//       },
//     },
//   };
  
//   return (
//     <motion.span
//       ref={ref}
//       className={`inline-block ${className}`}
//       variants={container}
//       initial="hidden"
//       animate={isInView ? "visible" : "hidden"}
//     >
//       {letters.map((letter, index) => (
//         <motion.span
//           key={index}
//           variants={child}
//           className="inline-block"
//           style={{ transformOrigin: '50% 100%' }}
//           whileHover={gradient ? { 
//             scale: 1.1,
//             textShadow: '0 0 20px rgba(167, 139, 250, 0.6)',
//             transition: { duration: 0.2 }
//           } : {}}
//         >
//           {letter === " " ? "\u00A0" : letter}
//         </motion.span>
//       ))}
//     </motion.span>
//   );
// };

// // Premium Button Component with enhanced effects
// const PremiumButton = ({ children, onClick, variant = "primary", className = "", icon: Icon }) => {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [isHovered, setIsHovered] = useState(false);
//   const buttonRef = useRef(null);

//   const handleMouseMove = (e) => {
//     if (!buttonRef.current) return;
//     const rect = buttonRef.current.getBoundingClientRect();
//     setMousePosition({
//       x: e.clientX - rect.left,
//       y: e.clientY - rect.top,
//     });
//   };

//   const variants = {
//     primary: "relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-900/25 hover:shadow-purple-700/40",
//     secondary: "relative overflow-hidden bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm",
//     ghost: "relative overflow-hidden text-white hover:bg-white/5"
//   };

//   return (
//     <motion.button
//       ref={buttonRef}
//       onClick={onClick}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={() => setIsHovered(false)}
//       className={`
//         ${variants[variant]} 
//         px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ease-out
//         transform hover:scale-105 active:scale-95
//         ${className}
//       `}
//       whileHover={{ y: -2 }}
//       whileTap={{ y: 0 }}
//     >
//       <span className="relative z-10 flex items-center gap-3">
//         {children}
//         {Icon && <Icon size={20} />}
//       </span>
      
//       {isHovered && variant === "primary" && (
//         <motion.div
//           className="absolute inset-0 bg-white/20"
//           style={{
//             left: mousePosition.x,
//             top: mousePosition.y,
//             x: '-50%',
//             y: '-50%',
//           }}
//           initial={{ scale: 0, opacity: 0.8 }}
//           animate={{ scale: 3, opacity: 0 }}
//           transition={{ duration: 0.6 }}
//         />
//       )}
      
//       {variant === "primary" && (
//         <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-violet-600/20 to-indigo-600/20 blur-xl -z-10" />
//       )}
//     </motion.button>
//   );
// };

// // Enhanced Floating Card with better 3D effects
// const PremiumCard = ({ children, delay = 0, className = "", glowColor = "purple" }) => {
//   const cardRef = useRef(null);
//   const [rotateX, setRotateX] = useState(0);
//   const [rotateY, setRotateY] = useState(0);
//   const [isHovered, setIsHovered] = useState(false);

//   const handleMouseMove = (e) => {
//     if (!cardRef.current) return;
//     const rect = cardRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;
//     const centerX = rect.width / 2;
//     const centerY = rect.height / 2;
//     setRotateX((y - centerY) / 15);
//     setRotateY((centerX - x) / 15);
//   };

//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.2 });

//   const glowColors = {
//     purple: 'rgba(147, 51, 234, 0.3)',
//     blue: 'rgba(59, 130, 246, 0.3)',
//     green: 'rgba(16, 185, 129, 0.3)',
//     pink: 'rgba(236, 72, 153, 0.3)',
//   };

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 60, rotateX: -10 }}
//       animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
//       transition={{ duration: 0.8, delay: delay * 0.15 }}
//       className={className}
//     >
//       <motion.div
//         ref={cardRef}
//         className="h-full rounded-3xl p-1 group"
//         style={{
//           background: `linear-gradient(145deg, 
//             rgba(255,255,255,0.1), 
//             rgba(255,255,255,0.05), 
//             rgba(255,255,255,0.02))`,
//           transformStyle: "preserve-3d",
//           transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
//         }}
//         animate={{
//           scale: isHovered ? 1.02 : 1,
//           rotateX,
//           rotateY,
//         }}
//         transition={{ type: "spring", stiffness: 100, damping: 20 }}
//         onMouseMove={handleMouseMove}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => {
//           setIsHovered(false);
//           setRotateX(0);
//           setRotateY(0);
//         }}
//       >
//         <div 
//           className="h-full rounded-[22px] p-8 bg-slate-950/90 backdrop-blur-xl border border-white/10 relative overflow-hidden"
//           style={{
//             transformStyle: "preserve-3d",
//             boxShadow: `0 25px 50px -12px ${glowColors[glowColor]}, 
//                        0 0 0 1px rgba(255, 255, 255, 0.05)`,
//           }}
//         >
//           {/* Animated background gradient */}
//           <motion.div
//             className="absolute inset-0 opacity-20"
//             style={{
//               background: `radial-gradient(circle at 50% 0%, 
//                 ${glowColors[glowColor]}, 
//                 transparent 70%)`,
//             }}
//             animate={{
//               scale: isHovered ? 1.5 : 1,
//               opacity: isHovered ? 0.3 : 0.1,
//             }}
//             transition={{ duration: 0.3 }}
//           />
          
//           <div className="relative z-10">
//             {children}
//           </div>
          
//           {/* Shine effect */}
//           <motion.div
//             className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
//             initial={{ x: "-100%" }}
//             animate={{ x: isHovered ? "100%" : "-100%" }}
//             transition={{ duration: 0.8 }}
//           />
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// // Enhanced Stats with better animations
// const StatsSection = () => {
//   const stats = [
//     { number: "100+", label: "Industry Experts", icon: Users, color: "text-purple-400" },
//     { number: "12/7", label: "Flexibility", icon: Clock, color: "text-blue-400" },
//     { number: "5K+", label: "Interviews Conducted", icon: TrendingUp, color: "text-green-400" },
//     { number: "97%", label: "Satisfaction Rate", icon: Star, color: "text-yellow-400" },
//   ];

//   return (
//     <div className="relative py-12 overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 z-10" />
      
//       <motion.div 
//         className="flex space-x-20 animate-scroll"
//         whileHover={{ animationPlayState: "paused" }}
//       >
//         {[...stats, ...stats, ...stats].map((stat, index) => (
//           <motion.div 
//             key={index} 
//             className="flex flex-col items-center min-w-[200px] group"
//             whileHover={{ scale: 1.1 }}
//             transition={{ type: "spring", stiffness: 300 }}
//           >
//             <div className="mb-2 p-3 rounded-full bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
//               <stat.icon size={24} className={stat.color} />
//             </div>
//             <div className={`text-4xl font-bold ${stat.color} mb-1`}>
//               {stat.number}
//             </div>
//             <div className="text-sm text-slate-400 text-center">{stat.label}</div>
//           </motion.div>
//         ))}
//       </motion.div>
//     </div>
//   );
// };

// // Enhanced Hero Section
// const HeroSection = ({ onApplyNowClick }) => {
//   const ref = useRef(null);
//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start start", "end start"]
//   });
  
//   const springScrollY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
//   const opacity = useTransform(springScrollY, [0, 0.5], [1, 0]);
//   const scale = useTransform(springScrollY, [0, 0.5], [1, 0.8]);
//   const y = useTransform(springScrollY, [0, 0.5], [0, 150]);
  
//   return (
//     <>
//       {/* Enhanced Background */}
//       <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 -z-20" />
//       <div className="fixed inset-0">
//         <AnimatedBackground />
//       </div>

//       <motion.section 
//         ref={ref}
//         style={{ opacity, scale, y }}
//         className="relative min-h-screen flex items-center justify-center pt-20 pb-40 overflow-hidden"
//       >
//         <div className="container max-w-7xl mx-auto px-6 relative z-10">
//           <div className="max-w-5xl mx-auto text-center">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//               className="mb-6"
//             >
//               <motion.span 
//                 className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-purple-200 bg-purple-900/20 rounded-full backdrop-blur-sm border border-purple-500/20"
//                 whileHover={{ 
//                   scale: 1.05,
//                   borderColor: "rgba(147, 51, 234, 0.4)",
//                   backgroundColor: "rgba(88, 28, 135, 0.3)"
//                 }}
//               >
//                 <Sparkles size={16} />
//                 NxtWave Interviewer Platform
//               </motion.span>
//             </motion.div>
            
//             <div className="mb-8">
//               <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-[0.9] mb-4">
//                 <AnimatedText text="For " />
//                 <AnimatedText 
//                   text="Industry Experts" 
//                   className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent"
//                   delay={0.3}
//                   gradient={true}
//                 />
//                 <br/>
//                 <AnimatedText 
//                   text="Shaping Tomorrow's" 
//                   delay={0.6}
//                 />
//                 <br/>
//                 <AnimatedText 
//                   text="Tech Talent" 
//                   className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
//                   delay={0.9}
//                   gradient={true}
//                 />
//               </h1>
//             </div>
            
//             <motion.p 
//               className="text-2xl text-slate-300 mb-12 leading-relaxed max-w-4xl mx-auto"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 1.2, duration: 1 }}
//             >
//               Leverage your expertise to mentor aspiring developers, earn competitive compensation, 
//               and enjoy unparalleled flexibility. Join an elite network dedicated to identifying the 
//               <motion.span 
//                 className="text-cyan-400 font-semibold"
//                 whileHover={{ textShadow: "0 0 20px rgba(34, 211, 238, 0.6)" }}
//               >
//                 {" "}nxtwave of talent
//               </motion.span>.
//             </motion.p>
            
//             <motion.div 
//               className="flex flex-col sm:flex-row gap-6 justify-center items-center"
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 1.4, duration: 0.8 }}
//             >
//               <PremiumButton 
//                 onClick={onApplyNowClick}
//                 variant="primary"
//                 icon={ArrowRight}
//                 className="text-xl shadow-2xl shadow-purple-900/30"
//               >
//                 Apply to Join Us
//               </PremiumButton>
              
//               <PremiumButton 
//                 variant="secondary"
//                 className="text-xl"
//               >
//                 Learn More
//               </PremiumButton>
//             </motion.div>
//           </div>
//         </div>
        
//         <motion.div 
//           className="absolute bottom-10 left-0 right-0 text-center"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 2, duration: 1 }}
//         >
//           <motion.div
//             animate={{ y: [0, 12, 0] }}
//             transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
//             className="cursor-pointer group"
//           >
//             <ChevronDown size={32} className="mx-auto text-slate-400 group-hover:text-purple-400 transition-colors" />
//           </motion.div>
//           <p className="text-sm text-slate-500 mt-3">Scroll to discover more</p>
//         </motion.div>
//       </motion.section>
      
//       <div className="relative z-10 bg-slate-950">
//         <CompaniesSection />
//         <BenefitsSection />
//         <CTASection onApplyNowClick={onApplyNowClick} />
//       </div>
//     </>
//   );
// };

// // Enhanced Companies Section
// const CompaniesSection = () => {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.3 });
  
//   const companies = [
//     { name: 'Google', color: 'from-blue-400 to-green-400' },
//     { name: 'Microsoft', color: 'from-blue-500 to-cyan-400' },
//     { name: 'Apple', color: 'from-gray-400 to-gray-600' },
//     { name: 'Amazon', color: 'from-orange-400 to-yellow-400' },
//     { name: 'Meta', color: 'from-blue-600 to-purple-600' },
//     { name: 'Netflix', color: 'from-red-500 to-red-700' },
//     { name: 'Tesla', color: 'from-red-400 to-pink-400' },
//     { name: 'Spotify', color: 'from-green-400 to-green-600' }
//   ];
  
//   return (
//     <section ref={ref} className="py-24 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 relative overflow-hidden">
//       {/* Background effects */}
//       <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10" />
      
//       <div className="container max-w-7xl mx-auto px-6 relative z-10">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-16"
//         >
//           <span className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-indigo-200 bg-indigo-900/20 rounded-full backdrop-blur-sm mb-4">
//             <Award size={16} />
//             Industry Recognition
//           </span>
//           <h2 className="text-5xl font-bold text-white mb-6">
//             From Tech Leaders to Tech Mentors
//           </h2>
//           <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
//             Our interviewers are seasoned professionals from leading tech companies,
//             bringing real-world insights to identify and nurture top talent.
//           </p>
//         </motion.div>
        
//         <motion.div 
//           className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 mb-16"
//           initial={{ opacity: 0 }}
//           animate={isInView ? { opacity: 1 } : {}}
//           transition={{ duration: 0.8, delay: 0.4 }}
//         >
//           {companies.map((company, index) => (
//             <motion.div
//               key={company.name}
//               className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
//               initial={{ opacity: 0, y: 20 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ duration: 0.6, delay: index * 0.1 }}
//               whileHover={{ 
//                 scale: 1.05, 
//                 y: -5,
//                 boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
//               }}
//             >
//               <div className={`text-2xl font-bold bg-gradient-to-r ${company.color} bg-clip-text text-transparent text-center`}>
//                 {company.name}
//               </div>
              
//               <motion.div
//                 className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//                 initial={false}
//               />
//             </motion.div>
//           ))}
//         </motion.div>
        
//         <StatsSection />
//       </div>
//     </section>
//   );
// };

// // Enhanced Benefits Section
// const BenefitsSection = () => {
//   const benefits = [
//     {
//       icon: DollarSign,
//       title: "Premium Compensation",
//       description: "Earn up to ₹900 per interview with transparent, tier-based payment system. Your expertise is valued and rewarded appropriately with competitive rates.",
//       color: "green",
//       features: ["Transparent pricing", "Instant payments", "Performance bonuses"]
//     },
//     {
//       icon: Clock,
//       title: "Ultimate Flexibility",
//       description: "Define your own schedule and work from anywhere. Accept interviews that align with your lifestyle, not the other way around.",
//       color: "blue", 
//       features: ["Choose your hours", "Work remotely", "Select preferred interviews"]
//     },
//     {
//       icon: Network,
//       title: "Elite Professional Network",
//       description: "Connect with 500+ top-tier tech professionals and industry leaders. Expand your network while shaping the next generation of talent.",
//       color: "purple",
//       features: ["Expert community", "Networking events", "Industry insights"]
//     },
//     {
//       icon: TrendingUp,
//       title: "Growth Opportunities",
//       description: "Enhance your evaluation skills, stay current with trends, and contribute to the future of tech talent development.",
//       color: "pink",
//       features: ["Skill development", "Industry trends", "Impact measurement"]
//     }
//   ];

//   return (
//     <section className="py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
//       {/* Enhanced background effects */}
//       <div className="absolute inset-0">
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
//         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
//       </div>
      
//       <div className="container max-w-7xl mx-auto px-6 relative z-10">
//         <div className="max-w-3xl mx-auto text-center mb-20">
//           <motion.span 
//             className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-purple-200 bg-purple-900/20 rounded-full backdrop-blur-sm mb-6"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <Sparkles size={16} />
//             Why Join Us?
//           </motion.span>
//           <motion.h2 
//             className="text-5xl font-bold text-white mb-6"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.2 }}
//           >
//             A Platform Designed for Your Expertise
//           </motion.h2>
//           <motion.p 
//             className="text-xl text-slate-300 leading-relaxed"
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ delay: 0.4 }}
//           >
//             We handle the logistics so you can focus on what you do best: identifying exceptional talent and making a lasting impact.
//           </motion.p>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
//           {benefits.map((benefit, index) => (
//             <PremiumCard 
//               key={index} 
//               delay={index} 
//               className="h-full"
//               glowColor={benefit.color}
//             >
//               <div className="flex flex-col h-full">
//                 <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm mb-6 group-hover:scale-110 transition-transform duration-300">
//                   <benefit.icon size={28} className="text-white" />
//                 </div>
                
//                 <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
//                 <p className="text-slate-300 text-lg leading-relaxed mb-6 flex-grow">{benefit.description}</p>
                
//                 <div className="space-y-2 mb-6">
//                   {benefit.features.map((feature, idx) => (
//                     <div key={idx} className="flex items-center gap-3 text-slate-400">
//                       <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
//                       <span>{feature}</span>
//                     </div>
//                   ))}
//                 </div>
                
//                 <motion.div 
//                   className="text-purple-400 flex items-center gap-2 font-semibold cursor-pointer group"
//                   whileHover={{ x: 8 }}
//                   transition={{ type: "spring", stiffness: 400, damping: 10 }}
//                 >
//                   Explore more 
//                   <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//                 </motion.div>
//               </div>
//             </PremiumCard>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// // Enhanced CTA Section
// const CTASection = ({ onApplyNowClick }) => {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, amount: 0.3 });

//   return (
//     <section ref={ref} className="py-32 relative overflow-hidden">
//       {/* Enhanced background */}
//       <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-blue-900/30" />
//       <div className="absolute inset-0">
//         <div className="h-full w-full" style={{ 
//           background: `radial-gradient(ellipse at center, 
//             rgba(147, 51, 234, 0.2) 0%, 
//             rgba(79, 70, 229, 0.1) 35%, 
//             transparent 70%)`
//         }} />
//       </div>
      
//       <div className="container max-w-6xl mx-auto px-6 relative z-10">
//         <PremiumCard className="w-full" glowColor="purple">
//           <div className="text-center max-w-4xl mx-auto py-8">
//             <motion.span 
//               className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-purple-200 bg-purple-900/30 rounded-full backdrop-blur-sm mb-8"
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={isInView ? { opacity: 1, scale: 1 } : {}}
//               transition={{ duration: 0.6 }}
//             >
//               <Globe size={16} />
//               Ready to Join?
//             </motion.span>
            
//             <motion.h2 
//               className="text-5xl font-bold text-white mb-8"
//               initial={{ opacity: 0, y: 30 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ duration: 0.8, delay: 0.2 }}
//             >
//               Become part of shaping the future of tech talent
//             </motion.h2>
            
//             <motion.p 
//               className="text-xl text-slate-300 mb-12 leading-relaxed"
//               initial={{ opacity: 0, y: 30 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ duration: 0.8, delay: 0.4 }}
//             >
//               Apply today to join our elite network of tech interviewers. Your expertise deserves a platform that truly values it and provides the growth opportunities you deserve.
//             </motion.p>
            
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ duration: 0.8, delay: 0.6 }}
//             >
//               <PremiumButton 
//                 onClick={onApplyNowClick}
//                 variant="primary"
//                 icon={ArrowRight}
//                 className="text-xl px-12 py-5 shadow-2xl shadow-purple-900/40 hover:shadow-purple-700/50"
//               >
//                 Apply to Join Us
//               </PremiumButton>
//             </motion.div>
//           </div>
//         </PremiumCard>
//       </div>
//     </section>
//   );
// };

// // Main Home Page Component
// const Home = () => {
//   const navigate = useNavigate();

//   // This function now uses the navigate hook to change the route
//   const handleApplyNowClick = () => {
//     navigate('/applicationform');
//   };
  
//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased overflow-x-hidden">
//       <main>
//         <HeroSection onApplyNowClick={handleApplyNowClick} />
//       </main>
      
//       {/* Enhanced Global Styles */}
//       <style>{`
//         @keyframes scroll {
//           0% { transform: translateX(0); }
//           100% { transform: translateX(calc(-200px * 4 - 5rem)); }
//         }
        
//         .animate-scroll {
//           animation: scroll 40s linear infinite;
//         }
        
//         .animate-scroll:hover {
//           animation-play-state: paused;
//         }

//         /* Custom scrollbar */
//         ::-webkit-scrollbar { width: 8px; height: 8px; }
//         ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.1); }
//         ::-webkit-scrollbar-thumb { 
//           background: linear-gradient(45deg, rgba(147, 51, 234, 0.5), rgba(59, 130, 246, 0.5));
//           border-radius: 10px;
//         }
//         ::-webkit-scrollbar-thumb:hover { 
//           background: linear-gradient(45deg, rgba(147, 51, 234, 0.8), rgba(59, 130, 246, 0.8));
//         }
        
//         /* Firefox */
//         * {
//           scrollbar-width: thin;
//           scrollbar-color: rgba(147, 51, 234, 0.5) transparent;
//         }

//         /* Smooth scroll behavior */
//         html { scroll-behavior: smooth; }
        
//         /* Enhanced text selection */
//         ::selection {
//           background: rgba(147, 51, 234, 0.3);
//           color: white;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default Home;



import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Sparkles,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  ChevronDown,
  Award,
  DollarSign,
  Network,
  Star,
  Globe
} from 'lucide-react';

// Simplified Background - no animations
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50" />
    </div>
  );
};

// Simplified Text - no letter animations
const AnimatedText = ({ text, className = "", once = true, delay = 0, gradient = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });

  return (
    <span
      ref={ref}
      className={`inline-block ${className}`}
    >
      {text}
    </span>
  );
};

// Simplified Button - no mouse tracking or complex effects
const PremiumButton = ({ children, onClick, variant = "primary", className = "", icon: Icon }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
    ghost: "text-white hover:bg-slate-800"
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variants[variant]}
        px-8 py-4 rounded-lg font-semibold text-lg transition-colors
        ${className}
      `}
    >
      <span className="flex items-center gap-3">
        {children}
        {Icon && <Icon size={20} />}
      </span>
    </button>
  );
};

// Simplified Card - no 3D effects or complex animations
const PremiumCard = ({ children, delay = 0, className = "", glowColor = "purple" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div
      ref={ref}
      className={className}
    >
      <div className="h-full rounded-xl border border-slate-700 bg-slate-800 p-8 hover:border-slate-600 transition-colors">
        {children}
      </div>
    </div>
  );
};

// Simplified Stats
const StatsSection = () => {
  const stats = [
    { number: "100+", label: "Industry Experts", icon: Users, color: "text-blue-400" },
    { number: "12/7", label: "Flexibility", icon: Clock, color: "text-cyan-400" },
    { number: "5K+", label: "Interviews Conducted", icon: TrendingUp, color: "text-green-400" },
    { number: "97%", label: "Satisfaction Rate", icon: Star, color: "text-yellow-400" },
  ];

  return (
    <div className="py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="mb-3 p-3 rounded-full bg-slate-800">
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className={`text-4xl font-bold ${stat.color} mb-1`}>
              {stat.number}
            </div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simplified Hero Section
const HeroSection = ({ onApplyNowClick }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const springScrollY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const opacity = useTransform(springScrollY, [0, 0.5], [1, 0]);
  const scale = useTransform(springScrollY, [0, 0.5], [1, 0.8]);
  const y = useTransform(springScrollY, [0, 0.5], [0, 150]);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900 -z-20" />
      <div className="fixed inset-0">
        <AnimatedBackground />
      </div>

      <section
        ref={ref}
        className="relative min-h-screen flex items-center justify-center pt-20 pb-40 overflow-hidden"
      >
        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-slate-300 bg-slate-800 rounded-full border border-slate-700">
                <Sparkles size={16} />
                NxtWave Interviewer Platform
              </span>
            </div>

            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-[0.9] mb-4">
                <AnimatedText text="For " />
                <AnimatedText
                  text="Industry Experts"
                  className="text-blue-400"
                  delay={0.3}
                  gradient={true}
                />
                <br/>
                <AnimatedText
                  text="Shaping Tomorrow's"
                  delay={0.6}
                />
                <br/>
                <AnimatedText
                  text="Tech Talent"
                  className="text-cyan-400"
                  delay={0.9}
                  gradient={true}
                />
              </h1>
            </div>

            <p className="text-2xl text-slate-300 mb-12 leading-relaxed max-w-4xl mx-auto">
              Leverage your expertise to mentor aspiring developers, earn competitive compensation,
              and enjoy unparalleled flexibility. Join an elite network dedicated to identifying the
              <span className="text-cyan-400 font-semibold">
                {" "}nxtwave of talent
              </span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <PremiumButton
                onClick={onApplyNowClick}
                variant="primary"
                icon={ArrowRight}
                className="text-xl"
              >
                Apply to Join Us
              </PremiumButton>

              <PremiumButton
                variant="secondary"
                className="text-xl"
              >
                Learn More
              </PremiumButton>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 text-center">
          <div className="cursor-pointer">
            <ChevronDown size={32} className="mx-auto text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 mt-3">Scroll to discover more</p>
        </div>
      </section>

      <div className="relative z-10 bg-slate-950">
        <CompaniesSection />
        <BenefitsSection />
        <CTASection onApplyNowClick={onApplyNowClick} />
      </div>
    </>
  );
};

// Simplified Companies Section
const CompaniesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const companies = [
    { name: 'Google', color: 'from-blue-400 to-green-400' },
    { name: 'Microsoft', color: 'from-blue-500 to-cyan-400' },
    { name: 'Apple', color: 'from-gray-400 to-gray-600' },
    { name: 'Amazon', color: 'from-orange-400 to-yellow-400' },
    { name: 'Meta', color: 'from-blue-600 to-purple-600' },
    { name: 'Netflix', color: 'from-red-500 to-red-700' },
    { name: 'Tesla', color: 'from-red-400 to-pink-400' },
    { name: 'Spotify', color: 'from-green-400 to-green-600' }
  ];

  return (
    <section ref={ref} className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-slate-300 bg-slate-800 rounded-full border border-slate-700 mb-4">
            <Award size={16} />
            Industry Recognition
          </span>
          <h2 className="text-5xl font-bold text-white mb-6">
            From Tech Leaders to Tech Mentors
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Our interviewers are seasoned professionals from leading tech companies,
            bringing real-world insights to identify and nurture top talent.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 mb-16">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="p-6 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="text-2xl font-bold text-white text-center">
                {company.name}
              </div>
            </div>
          ))}
        </div>

        <StatsSection />
      </div>
    </section>
  );
};

// Simplified Benefits Section
const BenefitsSection = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Premium Compensation",
      description: "Earn up to ₹900 per interview with transparent, tier-based payment system. Your expertise is valued and rewarded appropriately with competitive rates.",
      color: "green",
      features: ["Transparent pricing", "Instant payments", "Performance bonuses"]
    },
    {
      icon: Clock,
      title: "Ultimate Flexibility",
      description: "Define your own schedule and work from anywhere. Accept interviews that align with your lifestyle, not the other way around.",
      color: "blue",
      features: ["Choose your hours", "Work remotely", "Select preferred interviews"]
    },
    {
      icon: Network,
      title: "Elite Professional Network",
      description: "Connect with 500+ top-tier tech professionals and industry leaders. Expand your network while shaping the next generation of talent.",
      color: "purple",
      features: ["Expert community", "Networking events", "Industry insights"]
    },
    {
      icon: TrendingUp,
      title: "Growth Opportunities",
      description: "Enhance your evaluation skills, stay current with trends, and contribute to the future of tech talent development.",
      color: "pink",
      features: ["Skill development", "Industry trends", "Impact measurement"]
    }
  ];

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-slate-300 bg-slate-800 rounded-full border border-slate-700 mb-6">
            <Sparkles size={16} />
            Why Join Us?
          </span>
          <h2 className="text-5xl font-bold text-white mb-6">
            A Platform Designed for Your Expertise
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            We handle the logistics so you can focus on what you do best: identifying exceptional talent and making a lasting impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <PremiumCard
              key={index}
              delay={index}
              className="h-full"
              glowColor={benefit.color}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-slate-700 mb-6">
                  <benefit.icon size={28} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-6 flex-grow">{benefit.description}</p>

                <div className="space-y-2 mb-6">
                  {benefit.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="text-blue-400 flex items-center gap-2 font-semibold cursor-pointer">
                  Explore more
                  <ArrowRight size={18} />
                </div>
              </div>
            </PremiumCard>
          ))}
        </div>
      </div>
    </section>
  );
};

// Simplified CTA Section
const CTASection = ({ onApplyNowClick }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-32 bg-slate-900 relative overflow-hidden">
      <div className="container max-w-6xl mx-auto px-6 relative z-10">
        <PremiumCard className="w-full" glowColor="purple">
          <div className="text-center max-w-4xl mx-auto py-8">
            <span className="inline-flex items-center gap-2 py-2 px-4 text-sm font-medium text-slate-300 bg-slate-700 rounded-full border border-slate-600 mb-8">
              <Globe size={16} />
              Ready to Join?
            </span>

            <h2 className="text-5xl font-bold text-white mb-8">
              Become part of shaping the future of tech talent
            </h2>

            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              Apply today to join our elite network of tech interviewers. Your expertise deserves a platform that truly values it and provides the growth opportunities you deserve.
            </p>

            <div>
              <PremiumButton
                onClick={onApplyNowClick}
                variant="primary"
                icon={ArrowRight}
                className="text-xl px-12 py-5"
              >
                Apply to Join Us
              </PremiumButton>
            </div>
          </div>
        </PremiumCard>
      </div>
    </section>
  );
};

// Main Home Page Component
const Home = () => {
  const navigate = useNavigate();

  const handleApplyNowClick = () => {
    navigate('/applicationform');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased overflow-x-hidden">
      <main>
        <HeroSection onApplyNowClick={handleApplyNowClick} />
      </main>

      <style>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.1); }
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }

        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
        }

        /* Smooth scroll behavior */
        html { scroll-behavior: smooth; }

        /* Enhanced text selection */
        ::selection {
          background: rgba(59, 130, 246, 0.3);
          color: white;
        }
      `}</style>
    </div>
  );
}

export default Home;
