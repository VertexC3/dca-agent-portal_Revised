import React, { useState } from 'react';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function DrugInteractionAlerts({ prescriptions }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [interactions, setInteractions] = useState(null);

  const analyzeInteractions = async () => {
    setAnalyzing(true);
    try {
      const medications = prescriptions.map(p => ({
        name: p.medication_name,
        dosage: p.dosage,
        drug_class: p.drug_class
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the following list of medications for potential drug interactions. For each significant interaction found, provide:
1. The medications involved
2. The type of interaction (major, moderate, minor)
3. The potential effect
4. Clinical significance

Current medications:
${medications.map(m => `- ${m.name} ${m.dosage}${m.drug_class ? ` (${m.drug_class})` : ''}`).join('\n')}

Return ONLY interactions that are clinically significant. If no significant interactions are found, return an empty array.

IMPORTANT: This is for informational purposes only and should not replace professional medical judgment.`,
        response_json_schema: {
          type: "object",
          properties: {
            interactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  medications: { type: "array", items: { type: "string" } },
                  severity: { type: "string", enum: ["major", "moderate", "minor"] },
                  effect: { type: "string" },
                  clinical_significance: { type: "string" }
                }
              }
            },
            disclaimer: { type: "string" }
          }
        }
      });

      setInteractions(result);
    } catch (error) {
      console.error('Error analyzing interactions:', error);
      setInteractions({ 
        interactions: [], 
        disclaimer: 'Unable to analyze interactions at this time.' 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'major') return 'bg-red-100 text-red-800 border-red-300';
    if (severity === 'moderate') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#8B1F1F]" />
          Drug Interaction Check
        </h3>
        {!interactions && (
          <Button
            onClick={analyzeInteractions}
            disabled={analyzing || prescriptions.length < 2}
            size="sm"
            className="bg-[#8B1F1F] hover:bg-[#721919] text-white"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Interactions'
            )}
          </Button>
        )}
      </div>

      {interactions ? (
        <div className="space-y-4">
          {interactions.interactions && interactions.interactions.length > 0 ? (
            <>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  {interactions.interactions.length} potential interaction(s) detected. Please review and use clinical judgment.
                </p>
              </div>

              {interactions.interactions.map((interaction, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${getSeverityColor(interaction.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-800">
                      {interaction.medications.join(' + ')}
                    </p>
                    <span className="text-xs font-bold uppercase">
                      {interaction.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Effect:</span> {interaction.effect}
                  </p>
                  <p className="text-xs text-gray-600">
                    {interaction.clinical_significance}
                  </p>
                </div>
              ))}
            </>
          ) : (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <p className="text-sm text-green-800 font-medium">
                No significant drug interactions detected
              </p>
            </div>
          )}

          {interactions.disclaimer && (
            <p className="text-xs text-gray-500 italic">{interactions.disclaimer}</p>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setInteractions(null)}
            className="w-full"
          >
            Re-analyze
          </Button>
        </div>
      ) : (
        <div className="text-center py-8">
          <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 mb-2">
            {prescriptions.length < 2 
              ? 'Need at least 2 active prescriptions to check for interactions'
              : 'Click "Analyze Interactions" to check for potential drug interactions'
            }
          </p>
          <p className="text-xs text-gray-400">
            AI-powered analysis for informational purposes only
          </p>
        </div>
      )}
    </div>
  );
}