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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateTest } from "./actions";
import { useState } from "react";
import type { Question } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  subject: z.enum(["Physics", "Chemistry", "Mathematics", "Biology", "PCM (Full Syllabus)", "PCB (Full Syllabus)"], {
    required_error: "Please select a subject.",
  }),
  chapters: z.string(),
  difficultyMix: z.string().min(3, "Please specify the difficulty mix. E.g., '50% Easy, 30% Medium, 20% Hard'"),
  numQuestions: z.coerce.number().int().positive("Number of questions must be positive.").min(1, "At least one question is required.").max(150, "You can generate a maximum of 150 questions at a time."),
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
      chapters: "",
      difficultyMix: "40% Easy, 40% Medium, 20% Hard",
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
    if (isFullSyllabus) {
      form.setValue('chapters', '');
      form.setValue('numQuestions', 150);
      form.setValue('timeLimit', 180);
    }
  }, [isFullSyllabus, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!isFullSyllabus && (!values.chapters || values.chapters.trim().length < 3)) {
        form.setError("chapters", { type: "manual", message: "Please enter at least one chapter." });
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
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Client-side Error",
        description: "Could not connect to the server. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
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
            {!isFullSyllabus && (
              <FormField
                control={form.control}
                name="chapters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapters</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Rotational Dynamics, Thermodynamics, Electrostatics"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter chapter names, separated by commas.
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
                      <FormLabel>Difficulty Mix</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 50% Easy, 50% Hard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={isLoading || !selectedSubject}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Test...
                </>
              ) : (
                "Start Test"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
