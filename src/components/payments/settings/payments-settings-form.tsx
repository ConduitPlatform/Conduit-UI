'use client';

import { PaymentsConfig } from '@/lib/models/payments';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
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
import { SettingsFormActions } from '@/components/settings/SettingsFormActions';

interface Props {
  edit: boolean;
  isSaving?: boolean;
  setEdit: (arg0: boolean) => void;
  config: PaymentsConfig;
  onConfigChange: (field: keyof PaymentsConfig, value: any) => void;
}

export const PaymentsSettingsForm = ({
  edit,
  isSaving = false,
  setEdit,
  config,
  onConfigChange,
}: Props) => {
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
                <PasswordInput
                  id="secretKey"
                  value={config.secretKey || ''}
                  onChange={e => onConfigChange('secretKey', e.target.value)}
                  placeholder="Enter secret key"
                  disabled={!edit}
                />
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
                  <PasswordInput
                    id="stripeSecretKey"
                    value={config.stripe.secret_key}
                    onChange={e =>
                      onConfigChange('stripe', { secret_key: e.target.value })
                    }
                    placeholder="sk_test_..."
                    disabled={!edit}
                  />
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
                  <PasswordInput
                    id="vivaApiKey"
                    value={config.viva?.apiKey || ''}
                    onChange={e =>
                      onConfigChange('viva', { apiKey: e.target.value })
                    }
                    placeholder="Enter API key"
                    disabled={!edit}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vivaWebhookKey">Webhook Key</Label>
                  <PasswordInput
                    id="vivaWebhookKey"
                    value={config.viva?.webhookKey || ''}
                    onChange={e =>
                      onConfigChange('viva', { webhookKey: e.target.value })
                    }
                    placeholder="Enter webhook key"
                    disabled={!edit}
                  />
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
                      <PasswordInput
                        id="vivaClientSecret"
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
                      />
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
                    <PasswordInput
                      id="piraeusPassword"
                      value={config.piraeus?.password || ''}
                      onChange={e =>
                        onConfigChange('piraeus', {
                          password: e.target.value,
                        })
                      }
                      placeholder="Enter password"
                      disabled={!edit}
                    />
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
                  <PasswordInput
                    id="revenueCatWebhookSecret"
                    value={config.revenueCat?.webhookSecret || ''}
                    onChange={e =>
                      onConfigChange('revenueCat', {
                        webhookSecret: e.target.value,
                      })
                    }
                    placeholder="Enter webhook secret"
                    disabled={!edit}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SettingsFormActions
        edit={edit}
        isSaving={isSaving}
        onEdit={() => setEdit(true)}
        onCancel={() => setEdit(false)}
      />
    </>
  );
};
