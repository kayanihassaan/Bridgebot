export interface PerformanceMetric {
  memory: string;
  cpuEfficiency: string;
  linesOfCode: number;
}

export interface SecurityVulnerability {
  issue: string;
  severity: "High" | "Medium" | "Low";
  description: string;
  resolution: string;
}

export interface RefactoringDetails {
  nestedLoopsSimplified: string;
  deadCodeRemoved: string;
  cleanArchitectureApplied: string;
}

export interface ArchitecturalSummary {
  legacyParadoxesResolved: string[];
  targetStackFeatures: string[];
}

export interface MigrationResult {
  modernCode: string;
  architecturalSummary: ArchitecturalSummary;
  refactoringDetails: RefactoringDetails;
  securityAudit: {
    vulnerabilitiesFound: SecurityVulnerability[];
  };
  unitTests: string;
  performanceComparison: {
    legacy: PerformanceMetric;
    modern: PerformanceMetric;
  };
}

export interface ExampleCode {
  id: string;
  title: string;
  description: string;
  sourceLang: string;
  targetLang: string;
  code: string;
  suggestedOptions: string[];
}
