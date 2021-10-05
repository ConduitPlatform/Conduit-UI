import { createTransport } from "nodemailer";
import { EmailProviderClass } from "../../models/EmailProviderClass";
import { MandrillConfig } from "./mandrill.config";
import { Mandrill } from 'mandrill-api';
import { Template } from "../../interfaces/Template";
var mandrillTransport = require('nodemailer-mandrill-transport');
export class MandrillProvider extends EmailProviderClass{
   private  _mandrillSdk?: Mandrill;
   private apiKey: string;

    constructor(mandrillSettings: MandrillConfig){
        super(createTransport(mandrillTransport(mandrillSettings)));
        this._mandrillSdk = new Mandrill(mandrillSettings.auth.apiKey);
        this.apiKey = mandrillSettings.auth.apiKey;
        
    }
    
    async listTemplates(): Promise<Template[]>{
        const response = await new Promise<any>( (resolve) => this._mandrillSdk?.templates.list({key: this.apiKey},resolve));
        const retList:Template[] = response.map(async (element: any) => await this.getTemplateInfo(element.slug));
        return Promise.all(retList);
    }

    async getTemplateInfo(template_name:string):Promise<Template>{
        const response = await new Promise<any>( (resolve) => this._mandrillSdk?.templates.info({key: this.apiKey,name: template_name},resolve));
        const info : Template = {
            id :response.slug,
            name: response.name,
            versions: [{
                name: response.name,
                id: response.id,
                subject: response.subject,
                active: true,
                updatedAt: response.updated_at,
                htmlContent: response.code,
                plainContent: response.text,
            }],
            createdAt: response.created_at
        }
        return info;
    }
    
    async createTemplate(data: any): Promise<Template> {
        const response = await new Promise<any> ( (resolve) => this._mandrillSdk?.templates.add({
            key: this.apiKey,
            subject: data.subject,
            code: data.code,
            text: data.text,
            publish:true,
            name: data.name,

        },resolve));
        const created = await this.getTemplateInfo(response.slug);

        return  created;
    }
}
