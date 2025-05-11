"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type Agency, type SubAccount } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { saveActivityLogsNotification } from "@/queries/noti";
import { upsertSubAccount } from "@/queries/account";

import { useModal } from "@/hooks/use-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import FileUpload from "../common/FileUpload";

import {
  type SubAccountDetailsSchema,
  SubAccountDetailsValidator,
} from "@/lib/validators/subaccount-details";

// CHALLENGE Give access for Subaccount Guest they should see a different view maybe a form that allows them to create tickets

// CHALLENGE layout.tsx oonly runs once as a result if you remove permissions for someone and they keep navigating
// the layout.tsx wont fire again. solution- save the data inside metadata for current user.

interface SubAccountDetailsProps {
  //To add the sub account to the agency
  agencyDetails: Agency;
  details?: Partial<SubAccount>;
  userId: string;
  userName: string;
}

const SubAccountDetails: React.FC<SubAccountDetailsProps> = ({
  details,
  agencyDetails,
  userId,
  userName,
}) => {
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<SubAccountDetailsSchema>({
    resolver: zodResolver(SubAccountDetailsValidator),
    defaultValues: details,
  });

  async function onSubmit(values: SubAccountDetailsSchema) {
    try {
      const response = await upsertSubAccount({
        id: details?.id ? details.id : uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        agencyId: agencyDetails.id,
        connectAccountId: "",
        goal: 5000,
        ...values,
      });

      if (!response) throw new Error("No response from server");

      // await saveActivityLogsNotification({
      //   agencyId: response.agencyId,
      //   description: `${userName} | Updated subaccount | ${response.name}`,
      //   subAccountId: response.id,
      // });

      toast.success("account details saved", {
        description: "Successfully saved your account details.",
      });

      setClose();
      router.refresh();
    } catch (error) {
      toast.error("Oppse!", {
        description: "Could not save account details.",
      });
    }
  }

  React.useEffect(() => {
    if (details) {
      form.reset(details);
    }
  }, [details]);

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className= "w-full" >
    <CardHeader className="text-center" >
      <CardTitle className="text-2xl font-bold" >
      ✨ Account Setup ✨
</CardTitle>
  < CardDescription className = "text-gray-500" >
    Let's configure your account with the best details. 🚀
      </CardDescription>
      </CardHeader>
      < CardContent >
      <Form { ...form } >
      <form onSubmit={ form.handleSubmit(onSubmit) } className = "space-y-4" >
        <FormField
              disabled={ isSubmitting }
control = { form.control }
name = "subAccountLogo"
render = {({ field }) => (
  <FormItem>
  <FormLabel>Account Logo </FormLabel>
    < FormControl >
    <FileUpload
                      endpoint="subAccountLogo"
value = { field.value }
onChange = { field.onChange }
  />
  </FormControl>
  < FormMessage />
  </FormItem>
              )}
            />
  < div className = "flex md:flex-row gap-4" >
    <FormField
                disabled={ isSubmitting }
control = { form.control }
name = "name"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Account Name </FormLabel>
    < FormControl >
    <Input
                        required
placeholder = "Your account name"
{...field }
                      />
  </FormControl>
  < FormMessage />
  </FormItem>
                )}
              />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "companyEmail"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Acount Email </FormLabel>
    < FormControl >
    <Input placeholder="Your account email" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                )}
              />
  </div>
  < div className = "flex md:flex-row gap-4" >
    <FormField
                disabled={ isSubmitting }
control = { form.control }
name = "companyPhone"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Acount Phone Number </FormLabel>
    < FormControl >
    <Input
                        placeholder="Your account phone number"
{...field }
                      />
  </FormControl>
  < FormMessage />
  </FormItem>
                )}
              />
  </div>


  < div className = "flex md:flex-row gap-4" >
    <FormField
              disabled={ isSubmitting }
control = { form.control }
name = "vision"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Acount Vision </FormLabel>
    < FormControl >
    <Input
                      placeholder="Your account vision"
{...field }
                    />
  </FormControl>
  < FormMessage />
  </FormItem>
              )}
            />
  </div>

  < div className = "flex md:flex-row gap-4" >
    <FormField
            disabled={ isSubmitting }
control = { form.control }
name = "mission"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Acount Mission </FormLabel>
    < FormControl >
    <Input
                    placeholder="Your account mission"
{...field }
                  />
  </FormControl>
  < FormMessage />
  </FormItem>
            )}
          />
  </div>

  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "address"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Address </FormLabel>
  < FormControl >
  <Input placeholder="20 Cooper Square" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
              )}
            />
  < div className = "flex md:flex-row gap-4" >
    <FormField
                disabled={ isSubmitting }
control = { form.control }
name = "city"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>City </FormLabel>
  < FormControl >
  <Input placeholder="Dracut" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
                )}
              />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "state"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>State </FormLabel>
  < FormControl >
  <Input placeholder="Massachusetts" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
                )}
              />
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "zipCode"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Zip Code </FormLabel>
    < FormControl >
    <Input placeholder="MA 01826" {...field } />
      </FormControl>
      < FormMessage />
      </FormItem>
                )}
              />
  </div>
  < FormField
disabled = { isSubmitting }
control = { form.control }
name = "country"
render = {({ field }) => (
  <FormItem className= "flex-1" >
  <FormLabel>Country </FormLabel>
  < FormControl >
  <Input placeholder="United States" {...field } />
    </FormControl>
    < FormMessage />
    </FormItem>
              )}
            />
  < Button
type = "submit"
isLoading = { isSubmitting }
disabled = { isSubmitting }
  >
  Save Account Information
    </Button>
    </form>
    </Form>
    </CardContent>
    </Card>
   ); 
 };

export default SubAccountDetails;
