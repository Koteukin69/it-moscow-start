import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import type {GuideSpecialty} from "@/lib/guide-data";
import type {OrbAnimationProps} from "@/components/orb";
import SpecialtyCardVisual from "@/components/parent/specialty-card-visual";

export default function SpecialtyCard({specialty, image, imageAlign = "left", iconNames, orbPreset = "cyan"}: {
  specialty: GuideSpecialty;
  image: string;
  imageAlign?: "left" | "right";
  iconNames: string[];
  orbPreset?: OrbAnimationProps["preset"];
}) {
  return (
    <Card className="max-w-sm overflow-hidden">
      <SpecialtyCardVisual
        image={image}
        imageAlign={imageAlign}
        alt={specialty.title}
        iconNames={iconNames}
        orbPreset={orbPreset}
      />

      <CardHeader>
        <Badge variant="outline" className="w-fit font-mono text-xs">
          {specialty.code}
        </Badge>
        <CardTitle className="text-lg">{specialty.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{specialty.description}</p>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Для тех, кто:</span>
          <ul className="flex flex-col gap-1">
            {specialty.targetAudience.map((item) => (
              <li key={item} className="text-sm text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
