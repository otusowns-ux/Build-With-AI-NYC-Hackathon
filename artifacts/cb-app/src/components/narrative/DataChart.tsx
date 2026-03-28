import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { MortgageData, PPPData } from "@workspace/api-client-react/src/generated/api.schemas";

interface DataChartProps {
  type: "mortgage_denial" | "ppp_coverage" | string;
  mortgageData?: MortgageData;
  pppData?: PPPData;
}

export function DataChart({ type, mortgageData, pppData }: DataChartProps) {
  let data: any[] = [];
  let title = "";
  let description = "";
  let valueFormatter = (value: number) => value.toString();

  if (type === "mortgage_denial" && mortgageData) {
    title = "Mortgage Denial Rates";
    description = `Comparing local zip code ${mortgageData.zipCode || ''} to the citywide average.`;
    valueFormatter = (val: number) => `${val}%`;
    data = [
      {
        name: "This Area",
        value: mortgageData.denialRate || 0,
        color: "hsl(var(--foreground))"
      },
      {
        name: "City Avg",
        value: mortgageData.cityAvgDenialRate || 0,
        color: "hsl(var(--muted-foreground))"
      }
    ];
  } else if (type === "ppp_coverage" && pppData) {
    title = "PPP Loan Coverage";
    description = `Small business loan penetration in zip code ${pppData.zipCode || ''}.`;
    valueFormatter = (val: number) => `${val}%`;
    data = [
      {
        name: "This Area",
        value: pppData.coverageRate || 0,
        color: "hsl(var(--foreground))"
      },
      {
        name: "City Avg",
        value: pppData.cityAvgCoverageRate || 0,
        color: "hsl(var(--muted-foreground))"
      }
    ];
  } else {
    // Fallback or missing data
    return (
      <div className="my-8 p-6 border border-dashed border-border rounded-lg bg-muted/10 text-center">
        <p className="text-sm text-muted-foreground italic">Data visualization not available for this block.</p>
      </div>
    );
  }

  return (
    <div className="my-10 border border-border rounded-xl p-6 bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="mb-6">
        <h4 className="font-serif text-lg font-medium tracking-tight mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} barSize={48}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              tickFormatter={valueFormatter}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '13px',
                fontWeight: 500
              }}
              formatter={(value: number) => [valueFormatter(value), "Rate"]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
