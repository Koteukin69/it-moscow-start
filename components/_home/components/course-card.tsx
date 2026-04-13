import {Course} from "../blocks/courses";
import Image from "next/image";

export default function CourseCard({course}: {course: Course}) {
  return (<div className={"w-[264px] rounded-[10px] bg-white/10 glass-dark shrink-0 p-5 flex flex-col gap-2.5 font-medium items-center text-[20px]"}>
    <div className={"w-full aspect-square relative"}>
      {course.image ? (
        <Image src={course.image.src} alt={course.image.alt} fill className={"rounded-[5px]"}/>
      ) : (
        <div className={"flex justify-center items-center h-full px-4 text-center bg-gray-300/20 rounded-[5px]"}>
          <p>Изображение не найдено</p>
        </div>
      )}
    </div>
    {course.title}
  </div>);
}