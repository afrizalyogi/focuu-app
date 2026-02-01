import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

// Configuration for available tables and their behaviors
const TABLE_CONFIG: Record<
  string,
  {
    label: string;
    primaryKey: string;
    editable: boolean;
    creatable: boolean;
    deletable: boolean;
    hiddenColumns?: string[];
    readOnlyColumns?: string[];
    sortColumn?: string;
  }
> = {
  profiles: {
    label: "Profiles",
    primaryKey: "id",
    editable: true,
    creatable: false,
    deletable: false,
    readOnlyColumns: ["id", "email", "created_at"],
  },
  user_roles: {
    label: "User Roles",
    primaryKey: "id",
    editable: true,
    creatable: true,
    deletable: true,
  },
  sessions: {
    label: "Sessions",
    primaryKey: "id",
    editable: true,
    creatable: false,
    deletable: true,
  },
  user_analytics: {
    label: "User Analytics",
    primaryKey: "id",
    editable: false,
    creatable: false,
    deletable: true,
  },
  user_feedback: {
    label: "User Feedback",
    primaryKey: "id",
    editable: true,
    creatable: false,
    deletable: true,
  },
  pricing_plans: {
    label: "Pricing Plans",
    primaryKey: "id",
    editable: true,
    creatable: true,
    deletable: true,
  },
  subscriptions: {
    label: "Subscriptions",
    primaryKey: "id",
    editable: true,
    creatable: true,
    deletable: true,
  },
  payments: {
    label: "Payments",
    primaryKey: "id",
    editable: false,
    creatable: false,
    deletable: false,
  },
  orders: {
    label: "Orders",
    primaryKey: "id",
    editable: false,
    creatable: false,
    deletable: false,
  },
  user_settings: {
    label: "User Settings",
    primaryKey: "id",
    editable: true,
    creatable: false,
    deletable: true,
  },
  user_streaks: {
    label: "User Streaks",
    primaryKey: "id",
    editable: true,
    creatable: true,
    deletable: true,
    sortColumn: "updated_at",
  },
  user_preferences: {
    label: "User Preferences",
    primaryKey: "id",
    editable: true,
    creatable: false,
    deletable: true,
    sortColumn: "updated_at",
  },
  onboarding_preferences: {
    label: "Onboarding Prefs",
    primaryKey: "id",
    editable: true,
    creatable: false,
    deletable: true,
    sortColumn: "updated_at",
  },
};

const PAGE_SIZE = 20;

const UniversalTableManager = () => {
  const [selectedTable, setSelectedTable] = useState<string>("profiles");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingItem, setEditingItem] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [jsonInputErrors, setJsonInputErrors] = useState<
    Record<string, boolean>
  >({});

  const fetchData = useCallback(
    async (pageIndex = 0, resetColumns = false) => {
      setLoading(true);
      try {
        const config = TABLE_CONFIG[selectedTable];
        const sortCol = config.sortColumn || "created_at";

        const query = supabase
          .from(selectedTable)
          .select("*")
          .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)
          .order(sortCol, { ascending: false, nullsFirst: false });

        // Simple search if 'email' or 'name' or 'title' columns exist - hard to do generically without knowing schema beforehand
        // For now, we just fetch basic paged data.
        // If we want search, we need to know which column to search.
        // We can check if 'email' exists in the first row later, but for query building it's tricky.
        // Let's rely on basic pagination first.

        const { data: result, error } = await query;

        if (error) throw error;

        if (result) {
          if (result.length > 0 && resetColumns) {
            // Get all keys from the first few items to build column list
            const allKeys = Array.from(new Set(result.flatMap(Object.keys)));
            // Sort: id first, created_at last, others alphabetical
            const sortedKeys = allKeys.sort((a, b) => {
              if (a === "id") return -1;
              if (b === "id") return 1;
              if (a === "created_at") return 1;
              if (b === "created_at") return -1;
              return a.localeCompare(b);
            });
            setColumns(sortedKeys);
          } else if (result.length === 0 && resetColumns) {
            setColumns([]);
          }

          setData(result);
          setHasMore(result.length === PAGE_SIZE);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Fetch error:", err);
        toast({
          title: "Error fetching data",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedTable, toast],
  );

  useEffect(() => {
    setPage(0);
    fetchData(0, true);
  }, [selectedTable, search, fetchData]);

  const handleNextPage = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchData(prevPage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const pk = TABLE_CONFIG[selectedTable].primaryKey;
      const { error } = await supabase.from(selectedTable).delete().eq(pk, id);

      if (error) throw error;

      toast({ title: "Record deleted" });
      fetchData(page);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openDialog = (item: any = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item } : {});
    setJsonInputErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const pk = TABLE_CONFIG[selectedTable].primaryKey;
      const config = TABLE_CONFIG[selectedTable];

      // Filter out read-only columns if creating or editing?
      // Usually dependent on specific logic.
      // For simplicity, we send everything in formData except what's explicitly blocked if needed.

      const payload = { ...formData };

      let error;
      if (editingItem) {
        // Update
        const { error: updateError } = await supabase
          .from(selectedTable)
          .update(payload)
          .eq(pk, editingItem[pk]);
        error = updateError;
      } else {
        // Create
        // Remove ID if it's empty string to allow auto-gen
        if (payload[pk] === "") delete payload[pk];

        const { error: insertError } = await supabase
          .from(selectedTable)
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: "Success", description: "Record saved" });
      setIsDialogOpen(false);
      fetchData(page);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCellContent = (value: any) => {
    if (value === null || value === undefined)
      return <span className="text-muted-foreground italic">null</span>;
    if (typeof value === "boolean")
      return (
        <Badge variant={value ? "default" : "secondary"}>{String(value)}</Badge>
      );
    if (typeof value === "object")
      return (
        <span
          className="text-xs font-mono max-w-[200px] truncate block"
          title={JSON.stringify(value)}
        >
          {JSON.stringify(value)}
        </span>
      );
    return String(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (col: string, value: any) => {
    setFormData((prev) => ({ ...prev, [col]: value }));
  };

  const handleJsonChange = (col: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      setFormData((prev) => ({ ...prev, [col]: parsed }));
      setJsonInputErrors((prev) => ({ ...prev, [col]: false }));
    } catch (e) {
      // Temporarily store string for editing, but mark as error
      setFormData((prev) => ({ ...prev, [col]: value })); // Use raw string in state? No, type mismatch usually.
      // Better approach: Separate raw text state for JSON inputs?
      // For MVP: Just allow saving if valid, show error visual.
      setJsonInputErrors((prev) => ({ ...prev, [col]: true }));
    }
  };

  const config = TABLE_CONFIG[selectedTable];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Database Browser</CardTitle>
            <CardDescription>Manage application data directly.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Table" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TABLE_CONFIG).map(([key, conf]) => (
                  <SelectItem key={key} value={key}>
                    {conf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchData(page)}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            {config.creatable && (
              <Button onClick={() => openDialog(null)}>
                <Plus className="h-4 w-4 mr-2" /> New
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <ScrollArea className="w-full whitespace-nowrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Actions</TableHead>
                  {columns.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center"
                    >
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, i) => (
                    <TableRow key={row[config.primaryKey] || i}>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {config.editable && (
                              <DropdownMenuItem onClick={() => openDialog(row)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            )}
                            {config.deletable && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  handleDelete(row[config.primaryKey])
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell key={col}>
                          {renderCellContent(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <div className="flex w-full items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full md:w-fit"
            onClick={handlePrevPage}
            disabled={page === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="hidden md:block text-sm text-muted-foreground">
            Page {page + 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full md:w-fit"
            onClick={handleNextPage}
            disabled={!hasMore || loading}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Query" : "New Record"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {columns.map((col) => {
              // Skip read-only cols for creation if they are auto-generated usually, or if configured
              if (config.readOnlyColumns?.includes(col) && !editingItem)
                return null;

              const val = formData[col];
              const type = typeof val;
              const isJson = type === "object" && val !== null;
              const isBool = type === "boolean";

              return (
                <div key={col} className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium">
                    {col}
                  </label>
                  <div className="col-span-3">
                    {isBool ? (
                      <Select
                        value={String(formData[col] ?? false)}
                        onValueChange={(v) =>
                          handleInputChange(col, v === "true")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : config.primaryKey === col && editingItem ? (
                      <Input value={val} disabled className="bg-muted" />
                    ) : isJson ? (
                      <Textarea
                        defaultValue={JSON.stringify(val, null, 2)}
                        onChange={(e) => handleJsonChange(col, e.target.value)}
                        className={
                          jsonInputErrors[col] ? "border-destructive" : ""
                        }
                      />
                    ) : (
                      <Input
                        value={formData[col] || ""}
                        onChange={(e) => handleInputChange(col, e.target.value)}
                        placeholder="null"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UniversalTableManager;
