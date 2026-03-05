import Back from "@/components/back";
import FaqPage from "@/components/faq";
import {getFaq} from "@/lib/faq";

export default async function FAQ() {
  const faq = await getFaq();
  return (<div>
    <Back/>
    <FaqPage questions={faq} />
  </div>);
}
