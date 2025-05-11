"use client";

import React from "react";
import { AreaChart } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AreaChartComponentProps {
  data: any[];
}

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({ data }) => {
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChart
          data={data}
          index="created"
          categories={["amount_total"]}
          colors={["primary"]}
          yAxisWidth={30}
          showAnimation={true}
        />
      </CardContent>
    </Card>
  );
};

export default AreaChartComponent;
