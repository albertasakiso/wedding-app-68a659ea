import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, ArrowLeft, Check, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const rsvpSchema = z.object({
  guest_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
  attending: z.boolean(),
  has_plus_one: z.boolean(),
  plus_one_name: z.string().trim().max(100, "Name must be less than 100 characters").optional(),
  meal_preference: z.string().optional(),
  dietary_restrictions: z.string().trim().max(500, "Please keep dietary restrictions under 500 characters").optional(),
  message: z.string().trim().max(1000, "Message must be less than 1000 characters").optional(),
  receive_photos: z.boolean(),
});

type RSVPFormData = z.infer<typeof rsvpSchema>;

const RSVP = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RSVPFormData>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      guest_name: "",
      email: "",
      phone: "",
      attending: true,
      has_plus_one: false,
      plus_one_name: "",
      meal_preference: "",
      dietary_restrictions: "",
      message: "",
      receive_photos: true,
    },
  });

  const attending = form.watch("attending");
  const hasPlussOne = form.watch("has_plus_one");

  const onSubmit = async (data: RSVPFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("rsvps").insert({
        guest_name: data.guest_name,
        email: data.email,
        phone: data.phone || null,
        attending: data.attending,
        plus_one_name: data.has_plus_one ? data.plus_one_name : null,
        meal_preference: data.attending ? data.meal_preference : null,
        dietary_restrictions: data.attending ? data.dietary_restrictions : null,
        message: data.message,
      });

      if (error) throw error;

      // Add to email list if opted in
      if (data.receive_photos && data.email) {
        await supabase.from("email_list").upsert(
          { name: data.guest_name, email: data.email, phone: data.phone || null, source: "rsvp" },
          { onConflict: "email" }
        );
      }

      setIsSubmitted(true);
      toast.success("RSVP submitted successfully!");
    } catch (error) {
      console.error("RSVP submission error:", error);
      toast.error("Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="bg-card border border-primary/20 rounded-2xl p-12 shadow-elegant animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Thank You!
              </h1>
              <p className="text-muted-foreground font-body text-lg mb-8">
                {attending
                  ? "We're thrilled you can join us on our special day! We can't wait to celebrate with you."
                  : "We're sorry you won't be able to make it, but thank you for letting us know. You'll be in our hearts on our special day."}
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90 font-display">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return Home
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase mb-4 font-body">
              We Hope You Can Join Us
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              <span className="text-primary">RSVP</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg">
              Please respond by April 1st, 2026
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-primary/20 rounded-2xl p-8 md:p-12 shadow-elegant">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="guest_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-lg">Your Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="border-primary/20 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-lg">Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="border-primary/20 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-lg">Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+233 XX XXX XXXX"
                          className="border-primary/20 focus:border-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attending"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-lg">Will you be attending? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "yes")}
                          defaultValue={field.value ? "yes" : "no"}
                          className="flex gap-6 pt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="attending-yes" />
                            <Label htmlFor="attending-yes" className="font-body cursor-pointer">
                              Joyfully Accept
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="attending-no" />
                            <Label htmlFor="attending-no" className="font-body cursor-pointer">
                              Regretfully Decline
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {attending && (
                  <>
                    {/* Plus One */}
                    <FormField
                      control={form.control}
                      name="has_plus_one"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-body cursor-pointer">
                              I will be bringing a plus one
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {hasPlussOne && (
                      <FormField
                        control={form.control}
                        name="plus_one_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-display">Guest Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your guest's name"
                                className="border-primary/20 focus:border-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Meal Preference */}
                    <FormField
                      control={form.control}
                      name="meal_preference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-display text-lg">Meal Preference</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-primary/20 focus:border-primary">
                                <SelectValue placeholder="Select your meal preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beef">Filet Mignon</SelectItem>
                              <SelectItem value="chicken">Herb-Roasted Chicken</SelectItem>
                              <SelectItem value="fish">Pan-Seared Salmon</SelectItem>
                              <SelectItem value="vegetarian">Vegetarian Option</SelectItem>
                              <SelectItem value="vegan">Vegan Option</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Dietary Restrictions */}
                    <FormField
                      control={form.control}
                      name="dietary_restrictions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-display text-lg">Dietary Restrictions</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Allergies, dietary needs, etc."
                              className="border-primary/20 focus:border-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-display text-lg">Leave a Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your well wishes or a note for the couple..."
                          className="border-primary/20 focus:border-primary min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-display shadow-elegant"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Submit RSVP
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RSVP;
