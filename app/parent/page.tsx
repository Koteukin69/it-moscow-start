import ParentHeader from "@/components/parent/parent-header";
import ParentHero from "@/components/parent/parent-hero";
import ParentDirections from "@/components/parent/parent-directions";
import ParentCommunity from "@/components/parent/parent-community";
import ParentPartners from "@/components/parent/parent-partners";
import ParentEnrollment from "@/components/parent/parent-enrollment";
import ParentVideo from "@/components/parent/parent-video";
import ParentEarnings from "@/components/parent/parent-earnings";
import ParentCourses from "@/components/parent/parent-courses";
import ParentFaq from "@/components/parent/parent-faq";
import ParentConsultation from "@/components/parent/parent-consultation";
import ParentConsultationBanner from "@/components/parent/parent-consultation-banner";
import ParentNews from "@/components/parent/parent-news";
import ParentFooter from "@/components/parent/parent-footer";

export default function Parent() {
  return (
    <div className="min-h-dvh">
      <ParentHeader/>
      <ParentHero/>
      <ParentDirections/>
      <ParentVideo/>
      <ParentCommunity/>
      <ParentPartners/>
      <ParentEnrollment/>
      <ParentEarnings/>
      <ParentCourses/>
      <ParentFaq/>
      <ParentConsultation/>
      <ParentNews/>
      <ParentFooter/>
      <ParentConsultationBanner/>
    </div>
  );
}
