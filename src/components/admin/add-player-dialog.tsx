// src/components/admin/add-player-dialog.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addPlayer } from "@/lib/api";
import { Player } from "@/types";
import axios from "axios";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Player name must be at least 2 characters.",
  }),
  team: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  category: z.string(),
  basePrice: z.string(),
  preferredPosition: z.string(),
  preferredFoot: z.string(),
});

interface AddPlayerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AddPlayerDialog({ open, setOpen }: AddPlayerDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      team: "",
      category: "",
      basePrice: "",
      preferredPosition: "",
      preferredFoot: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      //create a Player object that adheres to the @/types/index.ts Player
      const newPlayer: Omit<Player, 'id'| 'goals'| 'assists'| 'matchesPlayed'| 'matchesWon'
      | 'matchesLost'| 'yellowCards' | 'redCards' | 'avatarUrl'> = {
        ...values,
        remarks: [], // Initialize remarks as an empty array
      };

      // const success = await addPlayer(newPlayer);
      axios.post("http://localhost:8080/api/players", newPlayer)
      .then((response) => {
        console.log("response", response)
        toast({
          title: "Player added successfully",
        });
        form.reset();
        setOpen(false)
      })
      .catch(function (error) {
        console.log(error);
      });

    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        title: "Something went wrong.",
        description: "There was an error adding the player. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
        <DialogHeader>
          <DialogTitle>Add a new player</DialogTitle>
          <DialogDescription>
            Make changes to the player here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cristiano Ronaldo" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the player's public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <FormControl>
                    <Input placeholder="Red Devils" {...field} />
                  </FormControl>
                  <FormDescription>
                    Assign the team to the respective player.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="5 star" {...field} />
                  </FormControl>
                  <FormDescription>
                    Assign the catgory to the respective player.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price</FormLabel>
                  <FormControl>
                    <Input placeholder="10 pts" {...field} />
                  </FormControl>
                  <FormDescription>
                    Mention the base price for the respective player.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Forward" {...field} />
                  </FormControl>
                  <FormDescription>
                    Mention the player preferred position.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferredFoot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Foot</FormLabel>
                  <FormControl>
                    <Input placeholder="Right" {...field} />
                  </FormControl>
                  <FormDescription>
                    Mention the player preferred foot.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
               <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            </DialogFooter>
          </form>
        </Form>
      
    </Dialog>
  )
}
