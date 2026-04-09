'use client';

import { PaymentsConfig } from '@/lib/models/payments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CurrencyCombobox } from '@/components/payments/currency-combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface Props {
  edit: boolean;
  setEdit: (arg0: boolean) => void;
  config: PaymentsConfig;
  onConfigChange: (field: keyof PaymentsConfig, value: any) => void;
}

export const PaymentsSettingsForm = ({
  edit,
  setEdit,
  config,
  onConfigChange,
}: Props) => {
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [showVivaApiKey, setShowVivaApiKey] = useState(false);
  const [showVivaWebhookKey, setShowVivaWebhookKey] = useState(false);
  const [showVivaClientSecret, setShowVivaClientSecret] = useState(false);
  const [showPiraeusPassword, setShowPiraeusPassword] = useState(false);
  const [showRevenueCatSecret, setShowRevenueCatSecret] = useState(false);

  return (
    <>
      <div className={'flex flex-col gap-4'}>
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key</Label>
                <div className="relative">
                  <Input
                    id="secretKey"
                    type={showSecretKey ? 'text' : 'password'}
                    value={config.secretKey || ''}
                    onChange={e => onConfigChange('secretKey', e.target.value)}
                    placeholder="Enter secret key"
                    disabled={!edit}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    disabled={!edit}
                  >
                    {showSecretKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <CurrencyCombobox
                  id="defaultCurrency"
                  value={config.defaultCurrency || 'USD'}
                  onValueChange={value =>
                    onConfigChange('defaultCurrency', value)
                  }
                  disabled={!edit}
                  placeholder="Select default currency…"
                />
                <p className="text-xs text-muted-foreground">
                  ISO 4217 code used when a currency is not specified elsewhere.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sendEmail">Send Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for payment events
                </p>
              </div>
              <Switch
                id="sendEmail"
                checked={config.sendEmail || false}
                onCheckedChange={checked =>
                  onConfigChange('sendEmail', checked)
                }
                disabled={!edit}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="redeemCodes">Enable Redeem Codes</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to redeem discount codes
                </p>
              </div>
              <Switch
                id="redeemCodes"
                checked={config.redeemCodes || false}
                onCheckedChange={checked =>
                  onConfigChange('redeemCodes', checked)
                }
                disabled={!edit}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stripe Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Stripe Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="stripeEnabled">Enable Stripe</Label>
                <p className="text-sm text-muted-foreground">
                  Enable Stripe payment processing
                </p>
              </div>
              <Switch
                id="stripeEnabled"
                checked={config.stripe.enabled}
                onCheckedChange={checked =>
                  onConfigChange('stripe', { enabled: checked })
                }
                disabled={!edit}
              />
            </div>

            {config.stripe.enabled && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="stripeSecretKey">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="stripeSecretKey"
                      type={showStripeKey ? 'text' : 'password'}
                      value={config.stripe.secret_key}
                      onChange={e =>
                        onConfigChange('stripe', { secret_key: e.target.value })
                      }
                      placeholder="sk_test_..."
                      disabled={!edit}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowStripeKey(!showStripeKey)}
                      disabled={!edit}
                    >
                      {showStripeKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Stripe secret key. This should start with
                    &quot;sk_test_&quot; for testing or &quot;sk_live_&quot; for
                    production.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Viva Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Viva Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vivaEnabled">Enable Viva</Label>
                <p className="text-sm text-muted-foreground">
                  Enable Viva payment processing
                </p>
              </div>
              <Switch
                id="vivaEnabled"
                checked={config.viva?.enabled || false}
                onCheckedChange={checked =>
                  onConfigChange('viva', { enabled: checked })
                }
                disabled={!edit}
              />
            </div>

            {config.viva?.enabled && (
              <div className="space-y-4">
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vivaEnvironment">Environment</Label>
                    <Select
                      value={config.viva?.environment || 'sandbox'}
                      onValueChange={value =>
                        onConfigChange('viva', { environment: value })
                      }
                      disabled={!edit}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vivaMid">Merchant ID</Label>
                    <Input
                      id="vivaMid"
                      value={config.viva?.mid || ''}
                      onChange={e =>
                        onConfigChange('viva', { mid: e.target.value })
                      }
                      placeholder="Enter merchant ID"
                      disabled={!edit}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vivaApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="vivaApiKey"
                      type={showVivaApiKey ? 'text' : 'password'}
                      value={config.viva?.apiKey || ''}
                      onChange={e =>
                        onConfigChange('viva', { apiKey: e.target.value })
                      }
                      placeholder="Enter API key"
                      disabled={!edit}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowVivaApiKey(!showVivaApiKey)}
                      disabled={!edit}
                    >
                      {showVivaApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vivaWebhookKey">Webhook Key</Label>
                  <div className="relative">
                    <Input
                      id="vivaWebhookKey"
                      type={showVivaWebhookKey ? 'text' : 'password'}
                      value={config.viva?.webhookKey || ''}
                      onChange={e =>
                        onConfigChange('viva', { webhookKey: e.target.value })
                      }
                      placeholder="Enter webhook key"
                      disabled={!edit}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowVivaWebhookKey(!showVivaWebhookKey)}
                      disabled={!edit}
                    >
                      {showVivaWebhookKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Smart Checkout</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vivaClientId">Client ID</Label>
                      <Input
                        id="vivaClientId"
                        value={config.viva?.smartCheckout?.clientId || ''}
                        onChange={e =>
                          onConfigChange('viva', {
                            smartCheckout: {
                              ...config.viva?.smartCheckout,
                              clientId: e.target.value,
                            },
                          })
                        }
                        placeholder="Enter client ID"
                        disabled={!edit}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vivaClientSecret">Client Secret</Label>
                      <div className="relative">
                        <Input
                          id="vivaClientSecret"
                          type={showVivaClientSecret ? 'text' : 'password'}
                          value={config.viva?.smartCheckout?.clientSecret || ''}
                          onChange={e =>
                            onConfigChange('viva', {
                              smartCheckout: {
                                ...config.viva?.smartCheckout,
                                clientSecret: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter client secret"
                          disabled={!edit}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowVivaClientSecret(!showVivaClientSecret)
                          }
                          disabled={!edit}
                        >
                          {showVivaClientSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Piraeus Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Piraeus Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="piraeusEnabled">Enable Piraeus</Label>
                <p className="text-sm text-muted-foreground">
                  Enable Piraeus payment processing
                </p>
              </div>
              <Switch
                id="piraeusEnabled"
                checked={config.piraeus?.enabled || false}
                onCheckedChange={checked =>
                  onConfigChange('piraeus', { enabled: checked })
                }
                disabled={!edit}
              />
            </div>

            {config.piraeus?.enabled && (
              <div className="space-y-4">
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="piraeusPosId">POS ID</Label>
                    <Input
                      id="piraeusPosId"
                      value={config.piraeus?.posId || ''}
                      onChange={e =>
                        onConfigChange('piraeus', { posId: e.target.value })
                      }
                      placeholder="Enter POS ID"
                      disabled={!edit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="piraeusAcquirerId">Acquirer ID</Label>
                    <Input
                      id="piraeusAcquirerId"
                      value={config.piraeus?.acquirerId || ''}
                      onChange={e =>
                        onConfigChange('piraeus', {
                          acquirerId: e.target.value,
                        })
                      }
                      placeholder="Enter acquirer ID"
                      disabled={!edit}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="piraeusMerchantId">Merchant ID</Label>
                    <Input
                      id="piraeusMerchantId"
                      value={config.piraeus?.merchantId || ''}
                      onChange={e =>
                        onConfigChange('piraeus', {
                          merchantId: e.target.value,
                        })
                      }
                      placeholder="Enter merchant ID"
                      disabled={!edit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="piraeusTicketingUrl">Ticketing URL</Label>
                    <Input
                      id="piraeusTicketingUrl"
                      value={config.piraeus?.ticketing_url || ''}
                      onChange={e =>
                        onConfigChange('piraeus', {
                          ticketing_url: e.target.value,
                        })
                      }
                      placeholder="Enter ticketing URL"
                      disabled={!edit}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="piraeusUsername">Username</Label>
                    <Input
                      id="piraeusUsername"
                      value={config.piraeus?.username || ''}
                      onChange={e =>
                        onConfigChange('piraeus', { username: e.target.value })
                      }
                      placeholder="Enter username"
                      disabled={!edit}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="piraeusPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="piraeusPassword"
                        type={showPiraeusPassword ? 'text' : 'password'}
                        value={config.piraeus?.password || ''}
                        onChange={e =>
                          onConfigChange('piraeus', {
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter password"
                        disabled={!edit}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowPiraeusPassword(!showPiraeusPassword)
                        }
                        disabled={!edit}
                      >
                        {showPiraeusPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RevenueCat Settings */}
        <Card>
          <CardHeader>
            <CardTitle>RevenueCat Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="revenueCatEnabled">Enable RevenueCat</Label>
                <p className="text-sm text-muted-foreground">
                  Enable RevenueCat subscription management
                </p>
              </div>
              <Switch
                id="revenueCatEnabled"
                checked={config.revenueCat?.enabled || false}
                onCheckedChange={checked =>
                  onConfigChange('revenueCat', { enabled: checked })
                }
                disabled={!edit}
              />
            </div>

            {config.revenueCat?.enabled && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="revenueCatWebhookSecret">
                    Webhook Secret
                  </Label>
                  <div className="relative">
                    <Input
                      id="revenueCatWebhookSecret"
                      type={showRevenueCatSecret ? 'text' : 'password'}
                      value={config.revenueCat?.webhookSecret || ''}
                      onChange={e =>
                        onConfigChange('revenueCat', {
                          webhookSecret: e.target.value,
                        })
                      }
                      placeholder="Enter webhook secret"
                      disabled={!edit}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowRevenueCatSecret(!showRevenueCatSecret)
                      }
                      disabled={!edit}
                    >
                      {showRevenueCatSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className={'py-4 flex justify-end'}>
        {edit ? (
          <div className={'flex gap-2'}>
            <Button
              type="button"
              className={'dark:border-gray-500'}
              variant={'outline'}
              onClick={() => {
                setEdit(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        ) : (
          <Button
            onClick={() => {
              setEdit(true);
            }}
          >
            Edit
          </Button>
        )}
      </div>
    </>
  );
};
