"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateTest } from "./actions";
import { useState } from "react";
import type { Question } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MultiSelect } from "@/components/ui/multi-select";


const chapterData: Record<"Physics" | "Chemistry" | "Mathematics" | "Biology", string[]> = {
  Physics: [
    "Rotational Dynamics", "Mechanical Properties of Fluids", "Kinetic Theory of Gases and Radiation", "Thermodynamics",
    "Oscillations", "Superposition of Waves", "Wave Optics", "Electrostatics", "Current Electricity",
    "Magnetic Fields due to Electric Current", "Magnetic Materials", "Electromagnetic Induction", "AC Circuits",
    "Dual Nature of Radiation and Matter", "Structure of Atoms and Nuclei", "Semiconductor Devices"
  ],
  Chemistry: [
    "Solid State", "Solutions", "Ionic Equilibria", "Chemical Thermodynamics", "Electrochemistry", "Chemical Kinetics",
    "Elements of Groups 16, 17 and 18", "Transition and Inner transition Elements", "Coordination Compounds",
    "Halogen Derivatives", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines",
    "Biomolecules", "Introduction to Polymer Chemistry", "Green Chemistry and Nanochemistry"
  ],
  Mathematics: [
    "Mathematical Logic", "Matrices", "Trigonometric Functions", "Pair of Straight Lines", "Vectors", "Line and Plane",
    "Linear Programming", "Differentiation", "Applications of Derivatives", "Indefinite Integration", "Definite Integration",
    "Application of Definite Integration", "Differential Equations", "Probability Distribution", "Binomial Distribution"
  ],
  Biology: [
    "Reproduction in Lower and Higher Plants", "Reproduction in Lower and Higher Animals", "Inheritance and Variation",
    "Molecular Basis of Inheritance", "Origin and Evolution of Life", "Plant Water Relation",
    "Plant Growth and Mineral Nutrition", "Respiration and Circulation", "Control and Co-ordination",
    "Human Health and Diseases", "Enhancement of Food Production", "Biotechnology", "Organisms and Populations",
    "Ecosystems and Energy Flow", "Biodiversity, Conservation and Environmental Issues"
  ],
};


const formSchema = z.object({
  subject: z.enum(["Physics", "Chemistry", "Mathematics", "Biology", "PCM (Full Syllabus)", "PCB (Full Syllabus)"], {
    required_error: "Please select a subject.",
  }),
  chapters: z.array(z.string()),
  difficultyMix: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Please select a difficulty.",
  }),
  numQuestions: z.coerce.number().int().positive("Number of questions must be positive.").min(1, "At least one question is required.").max(200, "You can generate a maximum of 200 questions at a time."),
  timeLimit: z.coerce.number().int().positive("Time limit must be positive."),
});

type ConfigurationFormProps = {
  onTestGenerated: (questions: Question[], timeLimit: number) => void;
};

export function ConfigurationForm({ onTestGenerated }: ConfigurationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chapters: [],
      difficultyMix: "Medium",
      numQuestions: 10,
      timeLimit: 15,
      subject: undefined,
    },
  });

  const selectedSubject = useWatch({
    control: form.control,
    name: 'subject'
  });

  const isFullSyllabus = selectedSubject === "PCM (Full Syllabus)" || selectedSubject === "PCB (Full Syllabus)";

  useEffect(() => {
    form.setValue('chapters', []);
    if (selectedSubject === "PCM (Full Syllabus)") {
      form.setValue('numQuestions', 150);
      form.setValue('timeLimit', 180);
    } else if (selectedSubject === "PCB (Full Syllabus)") {
      form.setValue('numQuestions', 200);
      form.setValue('timeLimit', 180);
    }
  }, [selectedSubject, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!isFullSyllabus && (!values.chapters || values.chapters.length === 0)) {
        form.setError("chapters", { type: "manual", message: "Please select at least one chapter." });
        setIsLoading(false);
        return;
      }

      const result = await generateTest(values);
      if (result.success && result.questions && result.timeLimit) {
        onTestGenerated(result.questions, result.timeLimit);
      } else {
        toast({
          variant: "destructive",
          title: "Error Generating Test",
          description: result.error || "An unknown error occurred.",
        });
        setIsLoading(false);
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Client-side Error",
        description: "Could not connect to the server. Please try again.",
      });
       setIsLoading(false);
    }
  }

  const availableChapters = selectedSubject && !isFullSyllabus ? chapterData[selectedSubject as keyof typeof chapterData] : [];

  return (
    <>
      <Dialog open={isLoading}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Test Rules & Instructions
            </DialogTitle>
            <DialogDescription>
              Please read the following rules carefully before starting the test.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-2">
                <li>The test will start in fullscreen mode to prevent distractions.</li>
                <li>Exiting fullscreen mode will automatically submit and end your test.</li>
                <li>Copying, pasting, or switching tabs is disabled during the test.</li>
                <li>A timer will be visible at the top. The test will auto-submit when the time runs out.</li>
                <li>You can navigate between questions using the palette on the right.</li>
            </ul>
             <div className="flex items-center justify-center p-8 flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-semibold text-foreground">Our AI is generating your personalized test... Please wait.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="text-primary" />
            Create Your Custom Test
          </CardTitle>
          <CardDescription>
            Configure the parameters below and our AI will generate a unique test just for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="PCM (Full Syllabus)">PCM (Full Syllabus)</SelectItem>
                        <SelectItem value="PCB (Full Syllabus)">PCB (Full Syllabus)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isFullSyllabus && selectedSubject && (
                 <FormField
                  control={form.control}
                  name="chapters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapters</FormLabel>
                        <MultiSelect
                          options={availableChapters.map(c => ({label: c, value: c}))}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          placeholder="Select chapters..."
                          animation={2}
                          maxCount={5}
                        />
                      <FormDescription>
                        Select the chapters you want to include in the test.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="numQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={isFullSyllabus}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Limit (Minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled={isFullSyllabus}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="difficultyMix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading || !selectedSubject}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Start Test"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
