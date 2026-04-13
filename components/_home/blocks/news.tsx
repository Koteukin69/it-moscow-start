import Title from "../components/title";
import CourseCard from "@/components/_home/components/course-card";
import {Image} from "@/components/_home/blocks/banner";

export type Course = {
  title: string;
  image?: Image;
  place: string;
  time: string;
  age: string;
  price: number;
}

const courses:Course[] = new Array(5).fill({
  title: "Геймстарт",
  place: "Центр программирования и кибербезопасности",
  time: "среда, пятница 17:00–17:45",
  age: "12–18 лет",
  price: 4850,
  image: {src: "/courses/GameStart.png", alt: "Геймстарт"}
});

export default function News() {
  return (<>
    <Title
      title={"Новости сообщества"}
      description={"Следите за последними событиями и обновлениями IT.Москва в нашем сообществе [ВКонтакте](https://vk.com/it.moscowpro)"}
    />
    <div className={"w-full"}>
      <div className={"flex flex-row flex-nowrap py-2 gap-5 overflow-x-auto w-full scrollbar-thin"}>
        {courses.map((course: Course, i) => (
          <CourseCard course={course} key={i}/>
        ))}
      </div>
    </div>
  </>);
}