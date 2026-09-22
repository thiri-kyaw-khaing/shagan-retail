import PageHeader from "@/components/custom/common/back-office/page-header";
import ChooseSectionActions from "@/components/custom/common/back-office/choose-section-actions";
import DashboardSummaryPreview from "@/components/custom/common/back-office/dashboard-summary-preview";
import SectionCardGrid from "@/components/custom/common/back-office/section-card-grid";

function BackOffice() {
  return (
    <div className="p-6">
      <PageHeader
        title="Choose a section"
        subtitle="Select a section to manage your store"
        action={<ChooseSectionActions />}
      />

      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[440px_1fr]">
        <DashboardSummaryPreview />
        <SectionCardGrid />
      </div>
    </div>
  );
}

export default BackOffice;
