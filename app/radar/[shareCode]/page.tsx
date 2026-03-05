import RadarView from "@/components/RadarView";

export default function PublicRadarPage({ params }: { params: { shareCode: string } }) {
    return (
        <RadarView shareCode={params.shareCode} />
    );
}
