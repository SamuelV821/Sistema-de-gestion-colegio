import { motion } from "motion/react";

export default function Button({text,onClick}){


    return(
            <motion.button 

            transition={{
                type:"spring",
                stiffness: 600,
                damping: 30
            }}

            whileHover={{backgroundColor: "#4f46e5"}}

            whileTap={{ 
                scale: 0.9,
                rotate: "0.1deg" 
            }}


            className="
            bg-slate-900
            shadow-lg
            shadow-slate-100
            text-white
            text-xs
            md:text-sm
            font-bold
            w-fit
            md:pl-6 md:pr-6 md:p-3
            pl-3 pr-3 p-2
            rounded-2xl "
            onClick={onClick}>{text}</motion.button>
    );

}