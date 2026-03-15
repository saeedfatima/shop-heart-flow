import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

const AdminAudit = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">System Audit Log</h1>
        <p className="text-muted-foreground">Monitor recent activities and events across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Recent system actions will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-12 text-muted-foreground bg-secondary/20 rounded-lg border-2 border-dashed">
            <Activity className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p>The audit endpoint is currently under development.</p>
            <p className="text-sm">Activity logs will start appearing here once the backend integration is ready.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminAudit;
