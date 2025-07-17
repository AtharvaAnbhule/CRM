"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Role } from "@prisma/client";

import { saveActivityLogsNotification } from "@/queries/noti";
import { sendInvitation } from "@/queries/invitation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

import {
  SendInvitationValidator,
  type SendInvitationSchema,
} from "@/lib/validators/send-invitation";
import { useModal } from "@/hooks/use-modal";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface SendInvitationProps {
  agencyId: string;
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const { setClose } = useModal();
  const [users, setUsers] = useState([]);
  const form = useForm<SendInvitationSchema>({
    resolver: zodResolver(SendInvitationValidator),
    mode: "onChange",
    defaultValues: {
      email: "",
      role: Role.SUBACCOUNT_USER,
    },
  });

  const onSubmit = async (values: SendInvitationSchema) => {
    try {
      const response = await sendInvitation(
        values.role,
        values.email,
        agencyId
      );

      const newUser = {
        id: users.length + 1,
        name: values.email.split("@")[0],
        email: values.email,
        role: values.role,
      };
      setUsers([...users, newUser]);

      await saveActivityLogsNotification({
        agencyId,
        description: `Invited ${response.email}`,
        subAccountId: undefined,
      });

      setClose();
      toast.success("Success", {
        description: "Created and sent invitation",
      });
    } catch (error) {
      setClose();
      toast.error("Oppse!", {
        description: "Could not send invitation",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Invitation for a member </CardTitle>
          <CardDescription>
            An invitation will be sent to the user.an invitation can be sent to
            an particular e - mail id once only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6">
              <FormField
                disabled={isSubmitting}
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email </FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isSubmitting}
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>User role </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AGENCY_ADMIN"> Admin </SelectItem>
                        <SelectItem value="SUBACCOUNT_USER">User</SelectItem>
                        <SelectItem value="SUBACCOUNT_GUEST">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                disabled={isSubmitting}
                isLoading={isSubmitting}
                type="submit"
                className="bg-violet-600 hover:bg-violet-400">
                Send Invitation
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="w-full max-w-2xl mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold"> Sent Requests </h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3 text-gray-400" />
            <Input
              placeholder="Search name..."
              className="pl-10 bg-gray-800 text-white"
            />
          </div>
        </div>
        <div className="border border-gray-700 bg-gray-900 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white"> Name </TableHead>
                <TableHead className="text-white"> Email </TableHead>
                <TableHead className="text-white"> Role </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length ? (
                users.map((user) => (
                  <TableRow key={user?.id}>
                    <TableCell className="text-white"> {user?.name} </TableCell>
                    <TableCell className="text-white">
                      {" "}
                      {user?.email}{" "}
                    </TableCell>
                    <TableCell className="text-white"> {user?.role} </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-white">
                    No team members yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SendInvitation;
