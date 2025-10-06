import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/components/ui/select"
import { MapPin, Mail, Phone, Clock } from "lucide-react"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { createFileRoute } from "@tanstack/react-router"

import PageLoader from "@/shared/components/PageLoader"
function ContactPage() {
  const { t } = useTranslation()
  const [formState, setFormState] = useState({
    fullName: "",
    companyName: "",
    companyType: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
  })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with state:", formState)
    // Here you would typically send the data to your API
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormState((prev) => ({ ...prev, companyType: value }))
  }

  const handleConsentChange = (checked: boolean) => {
    setFormState((prev) => ({ ...prev, consent: checked }))
  }

  return (
    <div className="bg-white text-gray-800">
      <section className="container mx-auto px-4 pt-24 pb-16 md:px-0 md:pt-32 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-5xl">{t("contact.title")}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">{t("contact.intro")}</p>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-3 lg:grid-cols-5">
          {/* Form Section */}
          <div className="md:col-span-2 lg:col-span-3">
            <form onSubmit={handleFormSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Sales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="fullName" className="mb-2 block font-medium">
                        {t("contact.form.fullName")} *
                      </label>
                      <Input id="fullName" name="fullName" placeholder="Jean Tagne" required value={formState.fullName} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label htmlFor="companyName" className="mb-2 block font-medium">
                        {t("contact.form.companyName")} *
                      </label>
                      <Input id="companyName" name="companyName" placeholder="Vente en gros SARL" required value={formState.companyName} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="companyType" className="mb-2 block font-medium">
                        {t("contact.form.companyType")} *
                      </label>
                      <Select required value={formState.companyType} onValueChange={handleSelectChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select company type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="fintech">FinTech</SelectItem>
                          <SelectItem value="transport">Transport & Logistics</SelectItem>
                          <SelectItem value="nonprofit">Non-Profit Organization</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block font-medium">
                        {t("contact.form.email")} *
                      </label>
                      <Input id="email" name="email" type="email" required placeholder="jean.tagene@example.com" value={formState.email} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="mb-2 block font-medium">
                        {t("contact.form.phone")} *
                      </label>
                      <Input id="phone" name="phone" type="tel" placeholder="633224455" required value={formState.phone} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label htmlFor="subject" className="mb-2 block font-medium">
                        {t("contact.form.subject")} *
                      </label>
                      <Input id="subject" name="subject" required placeholder="Integration Paiment" value={formState.subject} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-2 block font-medium">
                      {t("contact.form.message")}
                    </label>
                    <Textarea id="message" name="message" rows={6} placeholder="I will be have to work with you..." value={formState.message} onChange={handleInputChange} />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="consent" checked={formState.consent} onCheckedChange={handleConsentChange} />
                    <label htmlFor="consent" className="text-sm text-gray-600">
                      {t("contact.form.consent")}
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <CardAction className="w-full">
                    <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
                      {t("contact.form.submit")}
                    </Button>
                  </CardAction>
                </CardFooter>
              </Card>
            </form>
          </div>

          {/* Contact Info Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-gray-50 p-6">
              <h2 className="text-xl font-semibold">{t("contact.contactInfo.title")}</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start">
                  <MapPin className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{t("contact.contactInfo.address")}</h3>
                    <p className="text-gray-600">Bonaberie Grand Hangar, Douala Cameroun</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{t("contact.contactInfo.phone")}</h3>
                    <p className="text-gray-600">+237 123 456 789</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{t("contact.contactInfo.email")}</h3>
                    <p className="text-gray-600">contact@fujipay.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">{t("contact.contactInfo.hours")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/_public/contact")({
  pendingComponent: PageLoader,
  component: ContactPage,
})
