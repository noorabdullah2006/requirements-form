import React, { useState, useRef, useEffect } from 'react';
import './ProjectBrief.css';
import 'flag-icons/css/flag-icons.min.css';
import { submitBrief } from '../services/briefService';
import logoImg from '../assets/logo.png';

// ── Worldwide Country Codes List (195+ countries, sorted: PK first then A-Z) ──

const ALL_COUNTRIES = [
  // ── Popular / Regional First ──
  { iso: 'PK', flag: '🇵🇰', name: 'Pakistan',                    code: '+92'  },
  { iso: 'US', flag: '🇺🇸', name: 'United States',               code: '+1'   },
  { iso: 'GB', flag: '🇬🇧', name: 'United Kingdom',              code: '+44'  },
  { iso: 'AE', flag: '🇦🇪', name: 'United Arab Emirates',        code: '+971' },
  { iso: 'SA', flag: '🇸🇦', name: 'Saudi Arabia',                code: '+966' },
  { iso: 'IN', flag: '🇮🇳', name: 'India',                       code: '+91'  },
  { iso: 'CA', flag: '🇨🇦', name: 'Canada',                      code: '+1'   },
  { iso: 'AU', flag: '🇦🇺', name: 'Australia',                   code: '+61'  },
  // ── A ──
  { iso: 'AF', flag: '🇦🇫', name: 'Afghanistan',                 code: '+93'  },
  { iso: 'AL', flag: '🇦🇱', name: 'Albania',                     code: '+355' },
  { iso: 'DZ', flag: '🇩🇿', name: 'Algeria',                     code: '+213' },
  { iso: 'AD', flag: '🇦🇩', name: 'Andorra',                     code: '+376' },
  { iso: 'AO', flag: '🇦🇴', name: 'Angola',                      code: '+244' },
  { iso: 'AG', flag: '🇦🇬', name: 'Antigua and Barbuda',         code: '+1'   },
  { iso: 'AR', flag: '🇦🇷', name: 'Argentina',                   code: '+54'  },
  { iso: 'AM', flag: '🇦🇲', name: 'Armenia',                     code: '+374' },
  { iso: 'AT', flag: '🇦🇹', name: 'Austria',                     code: '+43'  },
  { iso: 'AZ', flag: '🇦🇿', name: 'Azerbaijan',                  code: '+994' },
  // ── B ──
  { iso: 'BS', flag: '🇧🇸', name: 'Bahamas',                     code: '+1'   },
  { iso: 'BH', flag: '🇧🇭', name: 'Bahrain',                     code: '+973' },
  { iso: 'BD', flag: '🇧🇩', name: 'Bangladesh',                  code: '+880' },
  { iso: 'BB', flag: '🇧🇧', name: 'Barbados',                    code: '+1'   },
  { iso: 'BY', flag: '🇧🇾', name: 'Belarus',                     code: '+375' },
  { iso: 'BE', flag: '🇧🇪', name: 'Belgium',                     code: '+32'  },
  { iso: 'BZ', flag: '🇧🇿', name: 'Belize',                      code: '+501' },
  { iso: 'BJ', flag: '🇧🇯', name: 'Benin',                       code: '+229' },
  { iso: 'BT', flag: '🇧🇹', name: 'Bhutan',                      code: '+975' },
  { iso: 'BO', flag: '🇧🇴', name: 'Bolivia',                     code: '+591' },
  { iso: 'BA', flag: '🇧🇦', name: 'Bosnia & Herzegovina',        code: '+387' },
  { iso: 'BW', flag: '🇧🇼', name: 'Botswana',                    code: '+267' },
  { iso: 'BR', flag: '🇧🇷', name: 'Brazil',                      code: '+55'  },
  { iso: 'BN', flag: '🇧🇳', name: 'Brunei',                      code: '+673' },
  { iso: 'BG', flag: '🇧🇬', name: 'Bulgaria',                    code: '+359' },
  { iso: 'BF', flag: '🇧🇫', name: 'Burkina Faso',                code: '+226' },
  { iso: 'BI', flag: '🇧🇮', name: 'Burundi',                     code: '+257' },
  // ── C ──
  { iso: 'CV', flag: '🇨🇻', name: 'Cabo Verde',                  code: '+238' },
  { iso: 'KH', flag: '🇰🇭', name: 'Cambodia',                    code: '+855' },
  { iso: 'CM', flag: '🇨🇲', name: 'Cameroon',                    code: '+237' },
  { iso: 'CF', flag: '🇨🇫', name: 'Central African Republic',    code: '+236' },
  { iso: 'TD', flag: '🇹🇩', name: 'Chad',                        code: '+235' },
  { iso: 'CL', flag: '🇨🇱', name: 'Chile',                       code: '+56'  },
  { iso: 'CN', flag: '🇨🇳', name: 'China',                       code: '+86'  },
  { iso: 'CO', flag: '🇨🇴', name: 'Colombia',                    code: '+57'  },
  { iso: 'KM', flag: '🇰🇲', name: 'Comoros',                     code: '+269' },
  { iso: 'CD', flag: '🇨🇩', name: 'Congo (DRC)',                  code: '+243' },
  { iso: 'CG', flag: '🇨🇬', name: 'Congo (Republic)',            code: '+242' },
  { iso: 'CR', flag: '🇨🇷', name: 'Costa Rica',                  code: '+506' },
  { iso: 'HR', flag: '🇭🇷', name: 'Croatia',                     code: '+385' },
  { iso: 'CU', flag: '🇨🇺', name: 'Cuba',                        code: '+53'  },
  { iso: 'CY', flag: '🇨🇾', name: 'Cyprus',                      code: '+357' },
  { iso: 'CZ', flag: '🇨🇿', name: 'Czechia',                     code: '+420' },
  // ── D ──
  { iso: 'DK', flag: '🇩🇰', name: 'Denmark',                     code: '+45'  },
  { iso: 'DJ', flag: '🇩🇯', name: 'Djibouti',                    code: '+253' },
  { iso: 'DM', flag: '🇩🇲', name: 'Dominica',                    code: '+1'   },
  { iso: 'DO', flag: '🇩🇴', name: 'Dominican Republic',          code: '+1'   },
  // ── E ──
  { iso: 'EC', flag: '🇪🇨', name: 'Ecuador',                     code: '+593' },
  { iso: 'EG', flag: '🇪🇬', name: 'Egypt',                       code: '+20'  },
  { iso: 'SV', flag: '🇸🇻', name: 'El Salvador',                 code: '+503' },
  { iso: 'GQ', flag: '🇬🇶', name: 'Equatorial Guinea',           code: '+240' },
  { iso: 'ER', flag: '🇪🇷', name: 'Eritrea',                     code: '+291' },
  { iso: 'EE', flag: '🇪🇪', name: 'Estonia',                     code: '+372' },
  { iso: 'SZ', flag: '🇸🇿', name: 'Eswatini',                    code: '+268' },
  { iso: 'ET', flag: '🇪🇹', name: 'Ethiopia',                    code: '+251' },
  // ── F ──
  { iso: 'FJ', flag: '🇫🇯', name: 'Fiji',                        code: '+679' },
  { iso: 'FI', flag: '🇫🇮', name: 'Finland',                     code: '+358' },
  { iso: 'FR', flag: '🇫🇷', name: 'France',                      code: '+33'  },
  // ── G ──
  { iso: 'GA', flag: '🇬🇦', name: 'Gabon',                       code: '+241' },
  { iso: 'GM', flag: '🇬🇲', name: 'Gambia',                      code: '+220' },
  { iso: 'GE', flag: '🇬🇪', name: 'Georgia',                     code: '+995' },
  { iso: 'DE', flag: '🇩🇪', name: 'Germany',                     code: '+49'  },
  { iso: 'GH', flag: '🇬🇭', name: 'Ghana',                       code: '+233' },
  { iso: 'GR', flag: '🇬🇷', name: 'Greece',                      code: '+30'  },
  { iso: 'GD', flag: '🇬🇩', name: 'Grenada',                     code: '+1'   },
  { iso: 'GT', flag: '🇬🇹', name: 'Guatemala',                   code: '+502' },
  { iso: 'GN', flag: '🇬🇳', name: 'Guinea',                      code: '+224' },
  { iso: 'GW', flag: '🇬🇼', name: 'Guinea-Bissau',               code: '+245' },
  { iso: 'GY', flag: '🇬🇾', name: 'Guyana',                      code: '+592' },
  // ── H ──
  { iso: 'HT', flag: '🇭🇹', name: 'Haiti',                       code: '+509' },
  { iso: 'HN', flag: '🇭🇳', name: 'Honduras',                    code: '+504' },
  { iso: 'HU', flag: '🇭🇺', name: 'Hungary',                     code: '+36'  },
  // ── I ──
  { iso: 'IS', flag: '🇮🇸', name: 'Iceland',                     code: '+354' },
  { iso: 'ID', flag: '🇮🇩', name: 'Indonesia',                   code: '+62'  },
  { iso: 'IR', flag: '🇮🇷', name: 'Iran',                        code: '+98'  },
  { iso: 'IQ', flag: '🇮🇶', name: 'Iraq',                        code: '+964' },
  { iso: 'IE', flag: '🇮🇪', name: 'Ireland',                     code: '+353' },
  { iso: 'IL', flag: '🇮🇱', name: 'Israel',                      code: '+972' },
  { iso: 'IT', flag: '🇮🇹', name: 'Italy',                       code: '+39'  },
  { iso: 'CI', flag: '🇨🇮', name: 'Ivory Coast',                 code: '+225' },
  // ── J ──
  { iso: 'JM', flag: '🇯🇲', name: 'Jamaica',                     code: '+1'   },
  { iso: 'JP', flag: '🇯🇵', name: 'Japan',                       code: '+81'  },
  { iso: 'JO', flag: '🇯🇴', name: 'Jordan',                      code: '+962' },
  // ── K ──
  { iso: 'KZ', flag: '🇰🇿', name: 'Kazakhstan',                  code: '+7'   },
  { iso: 'KE', flag: '🇰🇪', name: 'Kenya',                       code: '+254' },
  { iso: 'KI', flag: '🇰🇮', name: 'Kiribati',                    code: '+686' },
  { iso: 'KW', flag: '🇰🇼', name: 'Kuwait',                      code: '+965' },
  { iso: 'KG', flag: '🇰🇬', name: 'Kyrgyzstan',                  code: '+996' },
  // ── L ──
  { iso: 'LA', flag: '🇱🇦', name: 'Laos',                        code: '+856' },
  { iso: 'LV', flag: '🇱🇻', name: 'Latvia',                      code: '+371' },
  { iso: 'LB', flag: '🇱🇧', name: 'Lebanon',                     code: '+961' },
  { iso: 'LS', flag: '🇱🇸', name: 'Lesotho',                     code: '+266' },
  { iso: 'LR', flag: '🇱🇷', name: 'Liberia',                     code: '+231' },
  { iso: 'LY', flag: '🇱🇾', name: 'Libya',                       code: '+218' },
  { iso: 'LI', flag: '🇱🇮', name: 'Liechtenstein',               code: '+423' },
  { iso: 'LT', flag: '🇱🇹', name: 'Lithuania',                   code: '+370' },
  { iso: 'LU', flag: '🇱🇺', name: 'Luxembourg',                  code: '+352' },
  // ── M ──
  { iso: 'MG', flag: '🇲🇬', name: 'Madagascar',                  code: '+261' },
  { iso: 'MW', flag: '🇲🇼', name: 'Malawi',                      code: '+265' },
  { iso: 'MY', flag: '🇲🇾', name: 'Malaysia',                    code: '+60'  },
  { iso: 'MV', flag: '🇲🇻', name: 'Maldives',                    code: '+960' },
  { iso: 'ML', flag: '🇲🇱', name: 'Mali',                        code: '+223' },
  { iso: 'MT', flag: '🇲🇹', name: 'Malta',                       code: '+356' },
  { iso: 'MH', flag: '🇲🇭', name: 'Marshall Islands',            code: '+692' },
  { iso: 'MR', flag: '🇲🇷', name: 'Mauritania',                  code: '+222' },
  { iso: 'MU', flag: '🇲🇺', name: 'Mauritius',                   code: '+230' },
  { iso: 'MX', flag: '🇲🇽', name: 'Mexico',                      code: '+52'  },
  { iso: 'FM', flag: '🇫🇲', name: 'Micronesia',                  code: '+691' },
  { iso: 'MD', flag: '🇲🇩', name: 'Moldova',                     code: '+373' },
  { iso: 'MC', flag: '🇲🇨', name: 'Monaco',                      code: '+377' },
  { iso: 'MN', flag: '🇲🇳', name: 'Mongolia',                    code: '+976' },
  { iso: 'ME', flag: '🇲🇪', name: 'Montenegro',                  code: '+382' },
  { iso: 'MA', flag: '🇲🇦', name: 'Morocco',                     code: '+212' },
  { iso: 'MZ', flag: '🇲🇿', name: 'Mozambique',                  code: '+258' },
  { iso: 'MM', flag: '🇲🇲', name: 'Myanmar',                     code: '+95'  },
  // ── N ──
  { iso: 'NA', flag: '🇳🇦', name: 'Namibia',                     code: '+264' },
  { iso: 'NR', flag: '🇳🇷', name: 'Nauru',                       code: '+674' },
  { iso: 'NP', flag: '🇳🇵', name: 'Nepal',                       code: '+977' },
  { iso: 'NL', flag: '🇳🇱', name: 'Netherlands',                 code: '+31'  },
  { iso: 'NZ', flag: '🇳🇿', name: 'New Zealand',                 code: '+64'  },
  { iso: 'NI', flag: '🇳🇮', name: 'Nicaragua',                   code: '+505' },
  { iso: 'NE', flag: '🇳🇪', name: 'Niger',                       code: '+227' },
  { iso: 'NG', flag: '🇳🇬', name: 'Nigeria',                     code: '+234' },
  { iso: 'KP', flag: '🇰🇵', name: 'North Korea',                 code: '+850' },
  { iso: 'MK', flag: '🇲🇰', name: 'North Macedonia',             code: '+389' },
  { iso: 'NO', flag: '🇳🇴', name: 'Norway',                      code: '+47'  },
  // ── O ──
  { iso: 'OM', flag: '🇴🇲', name: 'Oman',                        code: '+968' },
  // ── P ──
  { iso: 'PW', flag: '🇵🇼', name: 'Palau',                       code: '+680' },
  { iso: 'PA', flag: '🇵🇦', name: 'Panama',                      code: '+507' },
  { iso: 'PG', flag: '🇵🇬', name: 'Papua New Guinea',            code: '+675' },
  { iso: 'PY', flag: '🇵🇾', name: 'Paraguay',                    code: '+595' },
  { iso: 'PE', flag: '🇵🇪', name: 'Peru',                        code: '+51'  },
  { iso: 'PH', flag: '🇵🇭', name: 'Philippines',                 code: '+63'  },
  { iso: 'PL', flag: '🇵🇱', name: 'Poland',                      code: '+48'  },
  { iso: 'PT', flag: '🇵🇹', name: 'Portugal',                    code: '+351' },
  // ── Q ──
  { iso: 'QA', flag: '🇶🇦', name: 'Qatar',                       code: '+974' },
  // ── R ──
  { iso: 'RO', flag: '🇷🇴', name: 'Romania',                     code: '+40'  },
  { iso: 'RU', flag: '🇷🇺', name: 'Russia',                      code: '+7'   },
  { iso: 'RW', flag: '🇷🇼', name: 'Rwanda',                      code: '+250' },
  // ── S ──
  { iso: 'KN', flag: '🇰🇳', name: 'Saint Kitts and Nevis',       code: '+1'   },
  { iso: 'LC', flag: '🇱🇨', name: 'Saint Lucia',                 code: '+1'   },
  { iso: 'VC', flag: '🇻🇨', name: 'Saint Vincent & Grenadines',  code: '+1'   },
  { iso: 'WS', flag: '🇼🇸', name: 'Samoa',                       code: '+685' },
  { iso: 'SM', flag: '🇸🇲', name: 'San Marino',                  code: '+378' },
  { iso: 'ST', flag: '🇸🇹', name: 'São Tomé & Príncipe',         code: '+239' },
  { iso: 'SN', flag: '🇸🇳', name: 'Senegal',                     code: '+221' },
  { iso: 'RS', flag: '🇷🇸', name: 'Serbia',                      code: '+381' },
  { iso: 'SC', flag: '🇸🇨', name: 'Seychelles',                  code: '+248' },
  { iso: 'SL', flag: '🇸🇱', name: 'Sierra Leone',                code: '+232' },
  { iso: 'SG', flag: '🇸🇬', name: 'Singapore',                   code: '+65'  },
  { iso: 'SK', flag: '🇸🇰', name: 'Slovakia',                    code: '+421' },
  { iso: 'SI', flag: '🇸🇮', name: 'Slovenia',                    code: '+386' },
  { iso: 'SB', flag: '🇸🇧', name: 'Solomon Islands',             code: '+677' },
  { iso: 'SO', flag: '🇸🇴', name: 'Somalia',                     code: '+252' },
  { iso: 'ZA', flag: '🇿🇦', name: 'South Africa',                code: '+27'  },
  { iso: 'SS', flag: '🇸🇸', name: 'South Sudan',                 code: '+211' },
  { iso: 'ES', flag: '🇪🇸', name: 'Spain',                       code: '+34'  },
  { iso: 'LK', flag: '🇱🇰', name: 'Sri Lanka',                   code: '+94'  },
  { iso: 'SD', flag: '🇸🇩', name: 'Sudan',                       code: '+249' },
  { iso: 'SR', flag: '🇸🇷', name: 'Suriname',                    code: '+597' },
  { iso: 'SE', flag: '🇸🇪', name: 'Sweden',                      code: '+46'  },
  { iso: 'CH', flag: '🇨🇭', name: 'Switzerland',                 code: '+41'  },
  { iso: 'SY', flag: '🇸🇾', name: 'Syria',                       code: '+963' },
  // ── T ──
  { iso: 'TW', flag: '🇹🇼', name: 'Taiwan',                      code: '+886' },
  { iso: 'TJ', flag: '🇹🇯', name: 'Tajikistan',                  code: '+992' },
  { iso: 'TZ', flag: '🇹🇿', name: 'Tanzania',                    code: '+255' },
  { iso: 'TH', flag: '🇹🇭', name: 'Thailand',                    code: '+66'  },
  { iso: 'TL', flag: '🇹🇱', name: 'Timor-Leste',                 code: '+670' },
  { iso: 'TG', flag: '🇹🇬', name: 'Togo',                        code: '+228' },
  { iso: 'TO', flag: '🇹🇴', name: 'Tonga',                       code: '+676' },
  { iso: 'TT', flag: '🇹🇹', name: 'Trinidad and Tobago',         code: '+1'   },
  { iso: 'TN', flag: '🇹🇳', name: 'Tunisia',                     code: '+216' },
  { iso: 'TR', flag: '🇹🇷', name: 'Turkey',                      code: '+90'  },
  { iso: 'TM', flag: '🇹🇲', name: 'Turkmenistan',                code: '+993' },
  { iso: 'TV', flag: '🇹🇻', name: 'Tuvalu',                      code: '+688' },
  // ── U ──
  { iso: 'UG', flag: '🇺🇬', name: 'Uganda',                      code: '+256' },
  { iso: 'UA', flag: '🇺🇦', name: 'Ukraine',                     code: '+380' },
  { iso: 'UY', flag: '🇺🇾', name: 'Uruguay',                     code: '+598' },
  { iso: 'UZ', flag: '🇺🇿', name: 'Uzbekistan',                  code: '+998' },
  // ── V ──
  { iso: 'VU', flag: '🇻🇺', name: 'Vanuatu',                     code: '+678' },
  { iso: 'VA', flag: '🇻🇦', name: 'Vatican City',                code: '+39'  },
  { iso: 'VE', flag: '🇻🇪', name: 'Venezuela',                   code: '+58'  },
  { iso: 'VN', flag: '🇻🇳', name: 'Vietnam',                     code: '+84'  },
  // ── Y ──
  { iso: 'YE', flag: '🇾🇪', name: 'Yemen',                       code: '+967' },
  // ── Z ──
  { iso: 'ZM', flag: '🇿🇲', name: 'Zambia',                      code: '+260' },
  { iso: 'ZW', flag: '🇿🇼', name: 'Zimbabwe',                    code: '+263' },
];

const BUSINESS_TYPES = [
  'Restaurant', 'E-commerce', 'Agency', 'Personal Brand',
  'Portfolio', 'Real Estate', 'Education', 'Healthcare', 'Software / Tech', 'Other'
];
const PROJECT_TYPES = [
  'New Website', 'Redesign Existing Website', 'Landing Page',
  'E-commerce Website', 'Web Application', 'Portfolio',
  'Business Website', 'Other'
];
const PROJECT_GOALS = [
  'Get more customers', 'Sell products online', 'Generate leads',
  'Show portfolio', 'Provide information', 'Online bookings', 'Other'
];
const PAGES_LIST = [
  { label: 'Home',              hint: 'Main landing page' },
  { label: 'About',             hint: 'Your story & team' },
  { label: 'Services',          hint: 'What you offer' },
  { label: 'Products',          hint: 'Items for sale / showcase' },
  { label: 'Pricing',           hint: 'Plans & cost breakdown' },
  { label: 'Portfolio',         hint: 'Past work & case studies' },
  { label: 'Gallery',           hint: 'Photos & media grid' },
  { label: 'Blog',              hint: 'Articles & news updates' },
  { label: 'FAQ',               hint: 'Common questions & answers' },
  { label: 'Contact',           hint: 'Get-in-touch form & map' },
  { label: 'Testimonials',      hint: 'Client reviews & feedback' },
  { label: 'Team',              hint: 'Meet the team members' },
  { label: 'Careers',           hint: 'Job openings & hiring' },
  { label: 'Privacy Policy',    hint: 'Legal data usage page' },
  { label: 'Terms & Conditions',hint: 'Legal terms of service' },
  { label: 'Other',             hint: 'Add a custom page name' },
];
const FEATURES_LIST = [
  { label: 'Contact Form',           hint: 'Visitors can send you a message' },
  { label: 'WhatsApp Integration',   hint: 'Chat button linking to WhatsApp' },
  { label: 'Newsletter',             hint: 'Email subscribe / announcement list' },
  { label: 'Blog',                   hint: 'Publish articles & news yourself' },
  { label: 'Search',                 hint: 'Let visitors search your site' },
  { label: 'User Login/Register',    hint: 'Accounts for clients or members' },
  { label: 'Admin Dashboard',        hint: 'Private panel to manage your site' },
  { label: 'CMS',                    hint: 'Easy panel to update text & images yourself' },
  { label: 'E-commerce',             hint: 'Full online store functionality' },
  { label: 'Shopping Cart',          hint: 'Add to cart & checkout flow' },
  { label: 'Payment Gateway',        hint: 'Accept card / online payments' },
  { label: 'Booking System',         hint: 'Clients can book a slot or service online' },
  { label: 'Appointment System',     hint: 'Schedule meetings / consultations' },
  { label: 'API Integration',        hint: 'Connect third-party tools & software' },
  { label: 'Google Maps',            hint: 'Show your location on a map' },
  { label: 'Reviews',                hint: 'Display star ratings & testimonials' },
  { label: 'Social Media Integration', hint: 'Link / embed Instagram, Facebook, etc.' },
  { label: 'Email Notifications',    hint: 'Auto-send emails on form submissions' },
  { label: 'File Upload',            hint: 'Visitors can upload documents / images' },
  { label: 'Multi-language',         hint: 'Arabic, Urdu, English etc. versions' },
  { label: 'SEO Optimization',       hint: 'Help Google find & rank your site' },
  { label: 'Analytics',              hint: 'Track visitors & page performance' },
  { label: 'Other',                  hint: 'Describe a custom feature below' },
];
const DESIGN_STYLES = [
  'Modern', 'Minimal', 'Professional', 'Luxury',
  'Creative', 'Corporate', 'Dark', 'Colorful', 'Other'
];
const CONTENT_ASSETS = ['Logo', 'Images', 'Videos', 'Text / Content', 'Brand Guidelines'];
const BUDGET_OPTIONS = [
  'Under $250', '$250 – $500', '$500 – $1,000',
  '$1,000 – $2,500', '$2,500+', 'Not sure / Need a quote'
];
const URGENCY_OPTIONS = ['Flexible', 'Normal', 'Urgent'];
const DOMAIN_OPTIONS  = ['Yes', 'No', 'Not sure'];
const HOSTING_OPTIONS = ['Yes', 'No', 'Not sure'];
const COMM_OPTIONS    = ['WhatsApp', 'Email', 'Phone Call'];

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const TOTAL_STEPS = 10;

const STEP_TITLES = [
  'Client Information',
  'Project Details',
  'Website Pages',
  'Features & Functionality',
  'Design Preferences',
  'Content & Assets',
  'Domain & Hosting',
  'Budget & Timeline',
  'File Uploads',
  'Additional Info & Submit'
];

const STEP_SUBTITLES = [
  'Please introduce yourself and your business.',
  'Tell us what you need and what your goal is.',
  'Select all pages you need for your website.',
  'Select all features required for your project.',
  'Help us understand the look and feel you want.',
  'Tell us about your existing content and assets.',
  'Help us understand your domain & hosting setup.',
  'Help us understand your budget range & deadline.',
  'Upload logos, documents, or reference files.',
  'Any additional instructions and contact method.'
];

const getPhaseName = (stepNum) => {
  if (stepNum <= 3) return "Phase 1: Profile Details";
  if (stepNum <= 6) return "Phase 2: Scope & Design";
  return "Phase 3: Launch Details";
};

// ── Custom Select Dropdown ──────────────────────────────────────────────────

function CustomSelect({ options, value, onChange, placeholder, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && ref.current) {
      setTimeout(() => {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  return (
    <div className={`pb-select-wrap ${isOpen ? 'open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`pb-select-trigger ${error ? 'err' : ''} ${!value ? 'placeholder-shown' : ''}`}
        onClick={handleToggle}
      >
        <span>{value || placeholder}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <ul className="pb-select-options">
          {options.map(opt => (
            <li
              key={opt}
              className={`pb-select-option ${value === opt ? 'sel' : ''}`}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              <span>{opt}</span>
              {value === opt && <span>✓</span>}
            </li>
          ))}
        </ul>
      )}
      {error && <span className="pb-err">{error}</span>}
    </div>
  );
}

// ── Searchable Worldwide Phone Input Component ──────────────────────────────

function PhoneInput({ value, onChange, country, onCountryChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && ref.current) {
      setTimeout(() => {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  const selectedCountry = ALL_COUNTRIES.find(c => c.iso === country) || ALL_COUNTRIES[0];

  const filteredCountries = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search) ||
    c.iso.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-phone-row" ref={ref}>
      <div className="pb-phone-country-wrap">
        <button
          type="button"
          className="pb-phone-code-btn"
          onClick={handleToggle}
        >
          <span className={`fi fi-${selectedCountry.iso.toLowerCase()} pb-phone-flag-icon`}></span>
          <span className="pb-phone-code-text">{selectedCountry.iso} {selectedCountry.code}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {isOpen && (
          <div className="pb-phone-dropdown">
            <div className="pb-phone-search-box">
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <ul className="pb-phone-list">
              {filteredCountries.map((c, idx) => (
                <li
                  key={`${c.iso}-${idx}`}
                  className={`pb-phone-opt ${c.iso === selectedCountry.iso ? 'sel' : ''}`}
                  onClick={() => {
                    onCountryChange(c.iso);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <span className={`fi fi-${c.iso.toLowerCase()} pb-opt-flag-icon`}></span>
                  <span className="pb-opt-name">{c.name}</span>
                  <span className="pb-opt-code">{c.code}</span>
                </li>
              ))}
              {filteredCountries.length === 0 && (
                <li className="pb-phone-no-res">No country found</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <input
        type="tel"
        name="phone"
        className={`pb-phone-input ${error ? 'err' : ''}`}
        value={value}
        onChange={onChange}
        placeholder="300 1234567"
      />
    </div>
  );
}

// ── Chips Component ──────────────────────────────────────────────────────────

function Chips({ options, value, onChange, error }) {
  return (
    <>
      <div className="pb-chips">
        {options.map(opt => (
          <button
            key={opt} type="button"
            className={`pb-chip ${value === opt ? 'sel' : ''}`}
            onClick={() => onChange(opt)}
          >{opt}</button>
        ))}
      </div>
      {error && <span className="pb-err">{error}</span>}
    </>
  );
}

// ── Checkbox Grid ────────────────────────────────────────────────────────────

function CheckboxGrid({ items, selected, onToggle }) {
  return (
    <div className="pb-check-grid">
      {items.map(item => {
        const label = typeof item === 'object' ? item.label : item;
        const hint  = typeof item === 'object' ? item.hint  : null;
        const isChecked = selected.includes(label);
        return (
          <label key={label} className={`pb-check-card ${isChecked ? 'chk' : ''}`}>
            <input type="checkbox" checked={isChecked} onChange={() => onToggle(label)} />
            <div className="pb-check-box">✓</div>
            <div className="pb-check-text">
              <span className="pb-check-label">{label}</span>
              {hint && <span className="pb-check-hint">{hint}</span>}
            </div>
          </label>
        );
      })}
    </div>
  );
}

function ReviewRow({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="pb-review-row">
      <span className="pb-review-label">{label}</span>
      <span className="pb-review-value">{Array.isArray(value) ? value.join(', ') : value}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProjectBrief() {
  const [step, setStep]             = useState(1);
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [projectId, setProjectId]   = useState(null);
  const [errors, setErrors]         = useState({});
  
  // Mobile accordion state
  const [accordionOpen, setAccordionOpen] = useState({ why: false, tips: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnimatingProgress, setIsAnimatingProgress] = useState(false);

  const triggerProgressAnimation = () => {
    setIsAnimatingProgress(true);
    setTimeout(() => {
      setIsAnimatingProgress(false);
    }, 850);
  };

  const fileInputRef = useRef(null);

  // Country Code (stored as ISO, e.g. 'PK')
  const [countryCode, setCountryCode] = useState('PK');

  // Existing Step States
  const [s1, setS1] = useState({ fullName:'', email:'', phone:'', companyName:'', role:'', businessType:'', otherBusinessType:'' });
  const [s2, setS2] = useState({ projectType:'', otherProjectType:'', businessDescription:'', projectGoal:'', otherProjectGoal:'' });
  const [s3, setS3] = useState({ pages:[], otherPage:'' });
  const [s4, setS4] = useState({ features:[], otherFeature:'' });
  const [s5, setS5] = useState({ designStyle:'', otherDesignStyle:'', preferredColors:'', hasExistingBranding:'', referenceUrls:'' });
  const [s6, setS6] = useState({ contentStatus:'', availableAssets:[] });
  const [s7, setS7] = useState({ hasDomain:'', domain:'', hasHosting:'', hostingDetails:'' });
  const [s8, setS8] = useState({ budget:'', deadline:'', urgency:'' });
  const [s9, setS9] = useState({ files:[], fileError:'' });
  const [s10, setS10] = useState({ additionalNotes:'', communicationMethod:'' });

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('syntrix_brief_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.step) setStep(d.step);
        if (d.s1) setS1(d.s1);
        if (d.s2) setS2(d.s2);
        if (d.s3) setS3(d.s3);
        if (d.s4) setS4(d.s4);
        if (d.s5) setS5(d.s5);
        if (d.s6) setS6(d.s6);
        if (d.s7) setS7(d.s7);
        if (d.s8) setS8(d.s8);
        if (d.s10) setS10(d.s10);
        if (d.countryCode) setCountryCode(d.countryCode);
      }
    } catch (err) {
      console.warn('Could not restore saved brief draft:', err);
    }
  }, []);

  // Auto-save form draft on state changes
  useEffect(() => {
    if (submitted) return;
    try {
      const draft = { step, s1, s2, s3, s4, s5, s6, s7, s8, s10, countryCode };
      localStorage.setItem('syntrix_brief_draft', JSON.stringify(draft));
    } catch (err) {
      // ignore
    }
  }, [step, s1, s2, s3, s4, s5, s6, s7, s8, s10, countryCode, submitted]);

  // Field handler
  const ch = (setter) => (e) => {
    const { name, value } = e.target;
    setter(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const toggle = (setter, field) => (val) =>
    setter(p => ({ ...p, [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val] }));

  const chip = (setter, field) => (val) => {
    setter(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  // Files
  const handleFiles = (e) => {
    const picked = Array.from(e.target.files);
    let err = '';
    const combined = [...s9.files, ...picked].slice(0, MAX_FILES);

    for (const f of combined) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        err = `"${f.name}" — unsupported file type.`;
        break;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        err = `"${f.name}" exceeds ${MAX_SIZE_MB}MB limit.`;
        break;
      }
    }

    setS9({ files: err ? s9.files : combined, fileError: err });
    e.target.value = '';
  };

  const removeFile = (idx) => setS9(p => ({ ...p, files: p.files.filter((_, i) => i !== idx), fileError: '' }));

  // Validators for 10 steps
  const validate = {
    1: () => {
      const e = {};
      if (!s1.fullName.trim())              e.fullName = 'Full Name is required';
      if (!s1.email.trim())                  e.email    = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(s1.email)) e.email = 'Enter a valid email';
      if (!s1.businessType)                  e.businessType = 'Select business sector';
      if (s1.businessType === 'Other' && !s1.otherBusinessType.trim())
        e.otherBusinessType = 'Please specify your business type';
      setErrors(e);
      return !Object.keys(e).length;
    },
    2: () => {
      const e = {};
      if (!s2.projectType)                   e.projectType          = 'Select a project type';
      if (!s2.businessDescription.trim())    e.businessDescription  = 'Please describe your project';
      if (!s2.projectGoal)                   e.projectGoal          = 'Select your main goal';
      if (s2.projectType === 'Other' && !s2.otherProjectType.trim())
        e.otherProjectType = 'Please specify the type';
      if (s2.projectGoal === 'Other' && !s2.otherProjectGoal.trim())
        e.otherProjectGoal = 'Please specify the goal';
      setErrors(e);
      return !Object.keys(e).length;
    },
    3: () => {
      const e = {};
      if (!s3.pages.length)                  e.pages    = 'Select at least one page';
      if (s3.pages.includes('Other') && !s3.otherPage.trim()) e.otherPage = 'Please specify';
      setErrors(e);
      return !Object.keys(e).length;
    },
    4: () => {
      const e = {};
      if (s4.features.includes('Other') && !s4.otherFeature.trim()) e.otherFeature = 'Please describe';
      setErrors(e);
      return !Object.keys(e).length;
    },
    5: () => {
      const e = {};
      if (!s5.designStyle)            e.designStyle          = 'Select a design style';
      if (!s5.hasExistingBranding)    e.hasExistingBranding  = 'Please answer this';
      if (s5.designStyle === 'Other' && !s5.otherDesignStyle.trim()) e.otherDesignStyle = 'Please specify';
      setErrors(e);
      return !Object.keys(e).length;
    },
    6: () => {
      const e = {};
      if (!s6.contentStatus) e.contentStatus = 'Please answer this';
      setErrors(e);
      return !Object.keys(e).length;
    },
    7: () => {
      const e = {};
      if (!s7.hasDomain)  e.hasDomain  = 'Please answer this';
      if (!s7.hasHosting) e.hasHosting = 'Please answer this';
      setErrors(e);
      return !Object.keys(e).length;
    },
    8: () => {
      const e = {};
      if (!s8.budget)   e.budget   = 'Select a budget range';
      if (!s8.urgency)  e.urgency  = 'Select urgency level';
      setErrors(e);
      return !Object.keys(e).length;
    },
    9: () => {
      setErrors({});
      return true;
    },
    10: () => {
      const e = {};
      if (!s10.communicationMethod) e.communicationMethod = 'Please select a preferred method';
      setErrors(e);
      return !Object.keys(e).length;
    }
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validate[step]()) {
      setErrors({});
      if (step < TOTAL_STEPS) {
        setStep(s => s + 1);
        triggerProgressAnimation();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step > 1) {
      setStep(s => s - 1);
      triggerProgressAnimation();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validate[10]()) return;
    setSubmitError('');
    setSubmitting(true);
    const selectedDialCode = (ALL_COUNTRIES.find(c => c.iso === countryCode) || ALL_COUNTRIES[0]).code;
    const fullPhone = `${selectedDialCode} ${s1.phone}`.trim();
    const formattedS1 = { ...s1, phone: fullPhone };
    try {
      const result = await submitBrief({ s1: formattedS1, s2, s3, s4, s5, s6, s7, s8, s10 }, s9.files);
      setProjectId(result.data?.projectId);
      setSubmitted(true);
      try {
        localStorage.removeItem('syntrix_brief_draft');
      } catch (e) {}
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen
  if (submitted) {
    return (
      <div className="pb-shell">
        <div className="pb-success-wrap">
          <div className="pb-success-card">
            <div className="pb-success-icon">🎉</div>
            <h2>Thank You!</h2>
            <p>
              Your project brief has been submitted successfully.<br />
              Our team will review your requirements and reach out via <strong>{s10.communicationMethod}</strong> shortly.
            </p>
            {projectId && (
              <p className="ref">Reference ID: <strong>#{projectId}</strong></p>
            )}
            <div className="pb-success-footer">
              <p>Submitted by <strong>{s1.fullName}</strong> ({s1.email})</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Progress percentage: (currentStep / totalSteps) * 100
  const pct = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="pb-shell">
      {/* ── Left Sidebar (Dark Navy SYNTRIX Desktop Sidebar) ────────────────── */}
      <aside className="pb-sidebar">
        <div className="pb-sidebar-brand-block">
          <div className="pb-brand-logo-wrap">
            <img src={logoImg} alt="Syntrix Logo" className="pb-brand-logo-img" />
          </div>
          <h2 className="pb-brand-name">
            SYNTR<span className="blue-x">IX</span>
          </h2>
          <p className="pb-brand-tagline">
            WE BUILD <span className="blue-word">DIGITAL</span> SOLUTIONS
          </p>
        </div>

        {/* Clean Sidebar Content */}
        <div className="pb-sidebar-info">
          <div className="pb-sidebar-card">
            <div className="pb-progress-circle-wrap">
              <svg className="pb-progress-ring" width="64" height="64">
                <circle className="pb-progress-ring-bg" cx="32" cy="32" r="26" />
                <circle
                  className="pb-progress-ring-fill"
                  cx="32" cy="32" r="26"
                  style={{ strokeDashoffset: 163 - (163 * pct) / 100 }}
                />
              </svg>
              <span className="pb-ring-text">{pct}%</span>
            </div>
            <div className="pb-sidebar-brief-text">
              <h3>Project Brief</h3>
              <p>Let's understand your project</p>
            </div>
          </div>

          <div className="pb-step-preview">
            <span className="pb-sp-label">CURRENT STEP</span>
            <p className="pb-sp-title">Step {step}: {STEP_TITLES[step - 1]}</p>
          </div>
        </div>

        {/* Sidebar Footer Help */}
        <div className="pb-sidebar-bottom">
          <div className="pb-need-help">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Need Help?
          </div>
          <p className="pb-help-sub">Our team is here to assist you</p>
          <div className="pb-contact-links">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=syntrixdevhouse@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="pb-contact-link"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              syntrixdevhouse@gmail.com
            </a>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="pb-main-area">
        {/* ── Compact Mobile Header (Visible on Mobile <= 1024px) ───────── */}
        <header className="pb-mobile-header">
          <div className="pb-mh-left">
            <img src={logoImg} alt="Syntrix Logo" className="pb-mh-logo" />
            <span className="pb-mh-brand">SYNTRIX</span>
          </div>
          <div className="pb-mh-right">
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=syntrixdevhouse@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="pb-mh-help-btn"
            >
              Need Help?
            </a>
            <button
              type="button"
              className="pb-mh-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              ☰
            </button>
          </div>
        </header>

        {/* Mobile Drawer / Quick Help Menu */}
        {mobileMenuOpen && (
          <div className="pb-mobile-drawer">
            <div className="pb-drawer-content">
              <h3>SYNTRIX Support</h3>
              <p>We build digital solutions for your business.</p>
              <div className="pb-drawer-links">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=syntrixdevhouse@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ✉️ syntrixdevhouse@gmail.com
                </a>
              </div>
              <button className="pb-drawer-close" onClick={() => setMobileMenuOpen(false)}>Close</button>
            </div>
          </div>
        )}
        {/* Top Header */}
        <header className="pb-top-header">
          <div className="pb-header-top-row">
            <div className="pb-header-title-box">
              <h1>Project Brief</h1>
              <p>Tell us about your project so we can give you an accurate estimate.</p>
            </div>
            <button type="button" className="pb-help-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Need Help?
            </button>
          </div>

          {/* Progress Bar */}
          <div className="pb-progress-bar-row">
            <div className="pb-progress-track">
              <div className="pb-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="pb-progress-pct-text">{pct}% Complete</span>
          </div>
        </header>

        {/* Content Grid */}
        <div className="pb-content-grid">
          {/* Main Card (Form) */}
          <main className="pb-form-card">
            <form onSubmit={handleNext}>

              {/* Step Header */}
              <div className="pb-step-header">
                <div>
                  <h2>Step {step}: {STEP_TITLES[step - 1]}</h2>
                  <p className="pb-step-desc">{STEP_SUBTITLES[step - 1]}</p>
                  {step === 1 && (
                    <div className="pb-auto-save-pill">
                      ⚡ Takes ~3 minutes · Progress auto-saved locally
                    </div>
                  )}
                </div>
                <div className="pb-step-badge">
                  {step === 1 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )}
                  {step === 2 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                      <line x1="9" y1="12" x2="15" y2="12"/>
                      <line x1="9" y1="16" x2="13" y2="16"/>
                    </svg>
                  )}
                  {step === 3 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  )}
                  {step === 4 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  )}
                  {step === 5 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="13.5" cy="6.5" r=".5"/>
                      <circle cx="17.5" cy="10.5" r=".5"/>
                      <circle cx="8.5" cy="7.5" r=".5"/>
                      <circle cx="6.5" cy="12.5" r=".5"/>
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.5-.73 1.5-1.6 0-.41-.15-.79-.41-1.08-.26-.29-.42-.68-.42-1.12 0-.88.72-1.6 1.6-1.6H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/>
                    </svg>
                  )}
                  {step === 6 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  )}
                  {step === 7 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  )}
                  {step === 8 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  )}
                  {step === 9 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  )}
                  {step === 10 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* ── STEP 1: CLIENT INFORMATION ─────────────────────────── */}
              {step === 1 && (
                <div className="pb-form-section">
                  <div className="pb-input-grid">
                    <div className="pb-field">
                      <label>Full Name <span className="req">*</span></label>
                      <input
                        name="fullName"
                        type="text"
                        value={s1.fullName}
                        onChange={ch(setS1)}
                        placeholder="e.g. Noor Abdullah"
                        className={errors.fullName ? 'err' : ''}
                      />
                      {errors.fullName && <span className="pb-err">{errors.fullName}</span>}
                    </div>

                    <div className="pb-field">
                      <label>Email Address <span className="req">*</span></label>
                      <input
                        name="email"
                        type="email"
                        value={s1.email}
                        onChange={ch(setS1)}
                        placeholder="e.g. noor@example.com"
                        className={errors.email ? 'err' : ''}
                      />
                      {errors.email && <span className="pb-err">{errors.email}</span>}
                    </div>

                    <div className="pb-field">
                      <label>Phone / WhatsApp <span className="req">*</span></label>
                      <PhoneInput
                        value={s1.phone}
                        onChange={ch(setS1)}
                        country={countryCode}
                        onCountryChange={setCountryCode}
                      />
                    </div>

                    <div className="pb-field">
                      <label>Company / Business Name <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>(Optional for Individuals)</span></label>
                      <input
                        name="companyName"
                        type="text"
                        value={s1.companyName}
                        onChange={ch(setS1)}
                        placeholder="e.g. Syntrix Solutions (or Individual)"
                      />
                    </div>
                  </div>

                  <div className="pb-field">
                    <label>Your Role / Position</label>
                    <input
                      name="role"
                      type="text"
                      value={s1.role}
                      onChange={ch(setS1)}
                      placeholder="e.g. CEO, Founder, Marketing Manager"
                    />
                  </div>

                  <div className="pb-field">
                    <label>Business Sector / Industry <span className="req">*</span></label>
                    <CustomSelect
                      options={BUSINESS_TYPES}
                      value={s1.businessType}
                      onChange={chip(setS1, 'businessType')}
                      placeholder="Select your industry"
                      error={errors.businessType}
                    />
                  </div>
                  {s1.businessType === 'Other' && (
                    <div className="pb-field pb-nested">
                      <label>Specify Industry <span className="req">*</span></label>
                      <input
                        name="otherBusinessType"
                        type="text"
                        value={s1.otherBusinessType}
                        onChange={ch(setS1)}
                        placeholder="e.g. Event Management"
                        className={errors.otherBusinessType ? 'err' : ''}
                      />
                      {errors.otherBusinessType && <span className="pb-err">{errors.otherBusinessType}</span>}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2: PROJECT DETAILS ────────────────────────────── */}
              {step === 2 && (
                <div className="pb-form-section">
                  <div className="pb-field">
                    <label>What do you need? <span className="req">*</span></label>
                    <CustomSelect
                      options={PROJECT_TYPES}
                      value={s2.projectType}
                      onChange={chip(setS2, 'projectType')}
                      placeholder="Select project type..."
                      error={errors.projectType}
                    />
                  </div>
                  {s2.projectType === 'Other' && (
                    <div className="pb-field pb-nested">
                      <label>Specify Project Type <span className="req">*</span></label>
                      <input
                        name="otherProjectType"
                        type="text"
                        value={s2.otherProjectType}
                        onChange={ch(setS2)}
                        placeholder="Describe type..."
                        className={errors.otherProjectType ? 'err' : ''}
                      />
                      {errors.otherProjectType && <span className="pb-err">{errors.otherProjectType}</span>}
                    </div>
                  )}

                  <div className="pb-field">
                    <label>Tell us about your business / project <span className="req">*</span></label>
                    <textarea
                      name="businessDescription"
                      value={s2.businessDescription}
                      onChange={ch(setS2)}
                      placeholder="Describe your business, products, or main project scope..."
                      rows={4}
                      className={errors.businessDescription ? 'err' : ''}
                    />
                    {errors.businessDescription && <span className="pb-err">{errors.businessDescription}</span>}
                  </div>

                  <div className="pb-field">
                    <label>Main Goal of this Website <span className="req">*</span></label>
                    <CustomSelect
                      options={PROJECT_GOALS}
                      value={s2.projectGoal}
                      onChange={chip(setS2, 'projectGoal')}
                      placeholder="Select main goal..."
                      error={errors.projectGoal}
                    />
                  </div>
                  {s2.projectGoal === 'Other' && (
                    <div className="pb-field pb-nested">
                      <label>Specify Goal <span className="req">*</span></label>
                      <input
                        name="otherProjectGoal"
                        type="text"
                        value={s2.otherProjectGoal}
                        onChange={ch(setS2)}
                        placeholder="Describe main goal..."
                        className={errors.otherProjectGoal ? 'err' : ''}
                      />
                      {errors.otherProjectGoal && <span className="pb-err">{errors.otherProjectGoal}</span>}
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 3: WEBSITE PAGES ──────────────────────────────── */}
              {step === 3 && (
                <div className="pb-form-section">
                  {errors.pages && <p className="pb-err" style={{ marginBottom: '12px' }}>{errors.pages}</p>}
                  <CheckboxGrid items={PAGES_LIST} selected={s3.pages} onToggle={toggle(setS3, 'pages')} />
                  {s3.pages.includes('Other') && (
                    <div className="pb-field pb-nested" style={{ marginTop: '16px' }}>
                      <label>Custom Page Name <span className="req">*</span></label>
                      <input
                        type="text"
                        value={s3.otherPage}
                        onChange={e => setS3(p => ({ ...p, otherPage: e.target.value }))}
                        placeholder="e.g. Franchise, Events"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 4: FEATURES & FUNCTIONALITY ───────────────────── */}
              {step === 4 && (
                <div className="pb-form-section">
                  <CheckboxGrid items={FEATURES_LIST} selected={s4.features} onToggle={toggle(setS4, 'features')} />
                  {s4.features.includes('Other') && (
                    <div className="pb-field pb-nested" style={{ marginTop: '16px' }}>
                      <label>Describe Custom Feature</label>
                      <input type="text" value={s4.otherFeature} onChange={e => setS4(p => ({ ...p, otherFeature: e.target.value }))} placeholder="e.g. Live Booking API" />
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 5: DESIGN PREFERENCES ─────────────────────────── */}
              {step === 5 && (
                <div className="pb-form-section">
                  <div className="pb-field">
                    <label>Preferred Design Style <span className="req">*</span></label>
                    <Chips options={DESIGN_STYLES} value={s5.designStyle} onChange={chip(setS5, 'designStyle')} error={errors.designStyle} />
                  </div>
                  {s5.designStyle === 'Other' && (
                    <div className="pb-field pb-nested">
                      <label>Specify Style <span className="req">*</span></label>
                      <input type="text" name="otherDesignStyle" value={s5.otherDesignStyle} onChange={ch(setS5)} placeholder="e.g. Retro 80s" />
                    </div>
                  )}

                  <div className="pb-field">
                    <label>Preferred Colors</label>
                    <input type="text" name="preferredColors" value={s5.preferredColors} onChange={ch(setS5)} placeholder="e.g. Dark Blue, Gold, White" />
                  </div>

                  <div className="pb-field">
                    <label>Existing Branding? <span className="req">*</span></label>
                    <Chips options={['Yes', 'No', 'Partially']} value={s5.hasExistingBranding} onChange={chip(setS5, 'hasExistingBranding')} error={errors.hasExistingBranding} />
                  </div>

                  <div className="pb-field">
                    <label>Reference Links</label>
                    <textarea name="referenceUrls" value={s5.referenceUrls} onChange={ch(setS5)} placeholder="Paste links to websites you like..." rows={3} />
                  </div>
                </div>
              )}

              {/* ── STEP 6: CONTENT & ASSETS ───────────────────────────── */}
              {step === 6 && (
                <div className="pb-form-section">
                  <div className="pb-field">
                    <label>Content Status <span className="req">*</span></label>
                    <Chips options={['Yes, everything is ready', 'Some content is ready', 'No, I need help with content']} value={s6.contentStatus} onChange={chip(setS6, 'contentStatus')} error={errors.contentStatus} />
                  </div>

                  <div className="pb-field">
                    <label>Available Assets</label>
                    <CheckboxGrid items={CONTENT_ASSETS} selected={s6.availableAssets} onToggle={toggle(setS6, 'availableAssets')} />
                  </div>
                </div>
              )}

              {/* ── STEP 7: DOMAIN & HOSTING ────────────────────────────── */}
              {step === 7 && (
                <div className="pb-form-section">
                  <div className="pb-field">
                    <label>Do you have a domain? <span className="req">*</span></label>
                    <Chips options={DOMAIN_OPTIONS} value={s7.hasDomain} onChange={chip(setS7, 'hasDomain')} error={errors.hasDomain} />
                  </div>
                  {s7.hasDomain === 'Yes' && (
                    <div className="pb-field pb-nested">
                      <label>Domain Name</label>
                      <input type="text" name="domain" value={s7.domain} onChange={ch(setS7)} placeholder="e.g. mycompany.com" />
                    </div>
                  )}

                  <div className="pb-field">
                    <label>Do you have hosting? <span className="req">*</span></label>
                    <Chips options={HOSTING_OPTIONS} value={s7.hasHosting} onChange={chip(setS7, 'hasHosting')} error={errors.hasHosting} />
                  </div>
                  {s7.hasHosting === 'Yes' && (
                    <div className="pb-field pb-nested">
                      <label>Hosting Provider</label>
                      <input type="text" name="hostingDetails" value={s7.hostingDetails} onChange={ch(setS7)} placeholder="e.g. Hostinger, Vercel" />
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 8: BUDGET & TIMELINE ──────────────────────────── */}
              {step === 8 && (
                <div className="pb-form-section">
                  <div className="pb-field">
                    <label>Estimated Budget <span className="req">*</span></label>
                    <Chips options={BUDGET_OPTIONS} value={s8.budget} onChange={chip(setS8, 'budget')} error={errors.budget} />
                  </div>

                  <div className="pb-field">
                    <label>Urgency Level <span className="req">*</span></label>
                    <Chips options={URGENCY_OPTIONS} value={s8.urgency} onChange={chip(setS8, 'urgency')} error={errors.urgency} />
                  </div>

                  <div className="pb-field">
                    <label>Desired Deadline</label>
                    <input type="date" name="deadline" value={s8.deadline} onChange={ch(setS8)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
              )}

              {/* ── STEP 9: FILE UPLOADS ───────────────────────────────── */}
              {step === 9 && (
                <div className="pb-form-section">
                  <div className="pb-field">
                    <label>Attachment Files <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '500' }}>(Optional — You can also share files later)</span></label>
                    <div
                      className="pb-upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); handleFiles({ target: { files: e.dataTransfer.files }, value: '' }); }}
                    >
                      <div className="pb-upload-icon">📁</div>
                      <p>Click to browse or drag & drop files here</p>
                      <span className="pb-sub-hint">Max {MAX_FILES} files · Max {MAX_SIZE_MB}MB each</span>
                    </div>
                    <input type="file" multiple ref={fileInputRef} onChange={handleFiles} style={{ display: 'none' }} />
                    {s9.files.length > 0 && (
                      <div className="pb-file-chips">
                        {s9.files.map((f, i) => (
                          <div key={i} className="pb-file-chip">
                            <span>{f.name}</span>
                            <button type="button" onClick={() => removeFile(i)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 10: ADDITIONAL INFO & SUBMIT ──────────────────── */}
              {step === 10 && (
                <div className="pb-form-section">
                  <div className="pb-review-section">
                    <div className="pb-review-header">
                      <h3>Summary Review</h3>
                      <button type="button" className="pb-btn-edit" onClick={() => setStep(1)}>Edit Info</button>
                    </div>
                    <ReviewRow label="Name" value={s1.fullName} />
                    <ReviewRow label="Email" value={s1.email} />
                    <ReviewRow label="Phone" value={`${(ALL_COUNTRIES.find(c => c.iso === countryCode) || ALL_COUNTRIES[0]).code} ${s1.phone}`} />
                    <ReviewRow label="Company" value={s1.companyName} />
                    <ReviewRow label="Project" value={s2.projectType} />
                    <ReviewRow label="Budget" value={s8.budget} />
                  </div>

                  <div className="pb-field">
                    <label>Additional Notes / Special Instructions</label>
                    <textarea name="additionalNotes" value={s10.additionalNotes} onChange={ch(setS10)} placeholder="Any special notes or instructions..." rows={4} />
                  </div>

                  <div className="pb-field">
                    <label>Preferred Contact Method <span className="req">*</span></label>
                    <Chips options={COMM_OPTIONS} value={s10.communicationMethod} onChange={chip(setS10, 'communicationMethod')} error={errors.communicationMethod} />
                  </div>

                  {submitError && (
                    <p className="pb-err" style={{ textAlign: 'center', marginBottom: '16px' }}>
                      ⚠ {submitError}
                    </p>
                  )}
                </div>
              )}

              {/* Navigation Bar */}
              <div className="pb-actions">
                <button
                  type="button"
                  className="pb-btn-back"
                  onClick={handleBack}
                  disabled={step === 1 || submitting}
                >
                  ← Back
                </button>

                {step < TOTAL_STEPS ? (
                  <button type="submit" className="pb-btn-next">
                    Next Step →
                  </button>
                ) : (
                  <button type="button" className="pb-btn-submit" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : '✓ Submit Project Brief'}
                  </button>
                )}
              </div>

            </form>
          </main>

          {/* Right Side Panel (Desktop Stacked Cards & Mobile Collapsible Accordions) */}
          <div className="pb-right-column">
            {/* Card 1: Why We Ask? */}
            <aside className="pb-why-card">
              <div className="pb-why-header">
                <div className="pb-why-icon">🛡️</div>
                <h3>Why We Ask?</h3>
              </div>
              <p className="pb-why-text">
                This information helps us understand your needs better and provide the most accurate solutions for your business.
              </p>

              <div className="pb-trust-items">
                <div className="pb-trust-item">
                  <div className="pb-trust-icon">🔒</div>
                  <div>
                    <strong>100% Secure</strong>
                    <span>Your data is safe with us</span>
                  </div>
                </div>

                <div className="pb-trust-item">
                  <div className="pb-trust-icon">⏱️</div>
                  <div>
                    <strong>Quick Response</strong>
                    <span>We'll review your requirements promptly</span>
                  </div>
                </div>

                <div className="pb-trust-item">
                  <div className="pb-trust-icon">🎯</div>
                  <div>
                    <strong>Tailored Solutions</strong>
                    <span>We provide solutions built around your needs</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Card 2: Almost There! */}
            <div className="pb-side-notice-card">
              <div className="pb-sn-icon">📝</div>
              <div>
                <h4>Almost There!</h4>
                <p>It takes less than <strong>5 minutes</strong> to complete the form. The more details you provide, the better we can help you.</p>
              </div>
            </div>

            {/* ── Mobile Accordions (Visible on Mobile <= 768px) ─────────────── */}
            <div className="pb-mobile-accordions">
              <div className="pb-accordion-item">
                <button
                  type="button"
                  className="pb-accordion-header"
                  onClick={() => setAccordionOpen(p => ({ ...p, why: !p.why }))}
                >
                  <span>🛡️ Why We Ask?</span>
                  <span>{accordionOpen.why ? '−' : '+'}</span>
                </button>
                {accordionOpen.why && (
                  <div className="pb-accordion-body">
                    <p>This information helps us understand your needs better and provide the most accurate solutions.</p>
                    <ul>
                      <li>🔒 <strong>100% Secure</strong> — Your data is safe with us</li>
                      <li>⏱️ <strong>Quick Response</strong> — Prompt requirement review</li>
                      <li>🎯 <strong>Tailored Solutions</strong> — Built around your goals</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="pb-accordion-item">
                <button
                  type="button"
                  className="pb-accordion-header"
                  onClick={() => setAccordionOpen(p => ({ ...p, tips: !p.tips }))}
                >
                  <span>⚡ Quick Tips & Security</span>
                  <span>{accordionOpen.tips ? '−' : '+'}</span>
                </button>
                {accordionOpen.tips && (
                  <div className="pb-accordion-body">
                    <p>It takes less than <strong>5 minutes</strong> to complete this form. Your entered details are automatically saved as you navigate between steps.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pb-footer">
          <div className="pb-footer-left">
            © 2025 SYNTRIX. All rights reserved.
          </div>
          <div className="pb-footer-center">
            <span className="pb-footer-badge">
              <span className="pb-badge-dot"></span>
              WE BUILD <span className="hl">DIGITAL SOLUTIONS</span>
            </span>
          </div>
          <div className="pb-footer-socials">
            <a href="https://www.facebook.com/share/1JW58h81gT/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="https://noorabdullah.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Website"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
          </div>
        </footer>
      </div>
    </div>
  );
}
