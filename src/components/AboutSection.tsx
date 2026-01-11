// Temporarily disabled component
const AboutSection = () => {
  return null;
};

export default AboutSection;

// import { motion } from "framer-motion";
// import { Heart, Recycle, Users, Shield } from "lucide-react";

// const AboutSection = () => {
//   const values = [
//     {
//       icon: Heart,
//       title: "Sustainable Fashion",
//       description: "We believe in giving clothes a second life, reducing waste and promoting conscious consumption."
//     },
//     {
//       icon: Recycle,
//       title: "Circular Economy",
//       description: "Every purchase and sale on रविस्त्र contributes to a more sustainable and circular fashion ecosystem."
//     },
//     {
//       icon: Users,
//       title: "Community First",
//       description: "Building a trusted community where buyers and sellers can connect safely and authentically."
//     },
//     {
//       icon: Shield,
//       title: "Safe & Secure",
//       description: "Our pass system ensures quality interactions while protecting both buyers and sellers."
//     }
//   ];

//   return (
//     <section className="py-16 md:py-24">
//       <div className="container mx-auto px-4">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="text-center max-w-3xl mx-auto mb-12"
//         >
//           <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
//             About <span className="text-gradient">रविस्त्र</span>
//           </h2>
//           <p className="text-muted-foreground text-lg leading-relaxed">
//             रविस्त्र is India's premier marketplace for pre-loved fashion. We're on a mission to make 
//             sustainable fashion accessible, affordable, and stylish. Our platform connects conscious 
//             buyers with sellers who believe in giving their clothes a second chance to shine.
//           </p>
//         </motion.div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
//           {values.map((value, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ delay: index * 0.1 }}
//               className="glass rounded-2xl p-6 text-center"
//             >
//               <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
//                 <value.icon className="w-6 h-6 text-white" />
//               </div>
//               <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
//               <p className="text-muted-foreground text-sm">{value.description}</p>
//             </motion.div>
//           ))}
//         </div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="glass rounded-3xl p-8 text-center max-w-4xl mx-auto"
//         >
//           <h3 className="font-display text-2xl font-bold mb-4">Our Vision</h3>
//           <p className="text-muted-foreground text-lg leading-relaxed">
//             We envision a world where fashion is circular, sustainable, and accessible to everyone. 
//             Through रविस्त्र, we're building a community that values quality over quantity, 
//             sustainability over fast fashion, and authentic connections over anonymous transactions.
//           </p>
//           <div className="flex flex-wrap justify-center gap-4 mt-6">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-primary">50K+</div>
//               <div className="text-sm text-muted-foreground">Happy Users</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-secondary">100K+</div>
//               <div className="text-sm text-muted-foreground">Items Saved</div>
//             </div>
//             <div className="text-center">
//               <div className="text-2xl font-bold text-accent">₹10L+</div>
//               <div className="text-sm text-muted-foreground">Money Saved</div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default AboutSection;