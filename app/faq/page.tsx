import Back from "@/components/back";
import FaqPage from "@/components/faq";
import {applicantFaq} from "@/lib/faq";

export default function FAQ() {
  return (<div>
    <Back/>
    <FaqPage questions={applicantFaq} />
  </div>);
}
