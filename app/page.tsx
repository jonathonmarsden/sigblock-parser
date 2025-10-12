'use client';

import { useState } from 'react';
import { Download, Share2, Loader2, User, Mail, Phone, Building, MapPin } from 'lucide-react';

interface Contact {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  title?: string;
  department?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  linkedin?: string;
  extraInfo?: string[];
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [contact, setContact] = useState<Contact | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const parseSignature = async () => {
    if (!inputText.trim()) {
      setError('Please enter a signature block');
      return;
    }

    setIsLoading(true);
    setError('');
    setContact(null);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse');
      }

      setContact(data.contact);
      setOriginalText(data.originalText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse signature');
    } finally {
      setIsLoading(false);
    }
  };

  const generateVCard = () => {
    if (!contact) return '';

    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';

    if (contact.name) {
      const last = contact.lastName || '';
      const first = contact.firstName || '';

      if (!first && !last && contact.name) {
        const parts = contact.name.split(' ');
        const lastName = parts.pop() || '';
        const firstName = parts.join(' ') || '';
        vcard += `FN:${contact.name}\n`;
        vcard += `N:${lastName};${firstName};;;\n`;
      } else {
        vcard += `FN:${contact.name}\n`;
        vcard += `N:${last};${first};;;\n`;
      }
    }

    if (contact.company) {
      const dept = contact.department || '';
      vcard += dept ? `ORG:${contact.company};${dept}\n` : `ORG:${contact.company}\n`;
    }

    if (contact.title) vcard += `TITLE:${contact.title}\n`;
    if (contact.email) vcard += `EMAIL;TYPE=INTERNET,WORK:${contact.email}\n`;
    if (contact.phone) vcard += `TEL;TYPE=WORK,VOICE:${contact.phone}\n`;
    if (contact.mobile) vcard += `TEL;TYPE=CELL,VOICE:${contact.mobile}\n`;

    const addressParts = [
      '',
      '',
      contact.streetAddress || '',
      contact.city || '',
      contact.state || '',
      contact.postalCode || '',
      contact.country || '',
    ];

    if (addressParts.some(p => p)) {
      vcard += `ADR;TYPE=WORK:${addressParts.join(';')}\n`;
    }

    if (contact.website) {
      const url = contact.website.startsWith('http') ? contact.website : `https://${contact.website}`;
      vcard += `URL;TYPE=WORK:${url}\n`;
    }

    if (contact.linkedin) {
      const url = contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`;
      vcard += `URL;TYPE=LinkedIn:${url}\n`;
    }

    vcard += 'CATEGORIES:SigBlockParser\n';

    const notes = [];
    if (contact.extraInfo && contact.extraInfo.length > 0) {
      notes.push('ADDITIONAL INFORMATION:');
      contact.extraInfo.forEach(info => notes.push(`• ${info}`));
      notes.push('');
    }
    notes.push('ORIGINAL SIGNATURE:');
    notes.push('----------------------------------------');
    notes.push(originalText);
    notes.push('----------------------------------------');
    notes.push('');
    notes.push('Parsed by SigBlock Parser');
    notes.push(`Date: ${new Date().toISOString().split('T')[0]}`);

    const noteText = notes.join('\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    vcard += `NOTE:${noteText}\n`;

    vcard += 'END:VCARD';

    return vcard;
  };

  const downloadVCard = () => {
    const vcard = generateVCard();
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact?.name || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareVCard = async () => {
    const vcard = generateVCard();
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const file = new File([blob], `${contact?.name || 'contact'}.vcf`, { type: 'text/vcard' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Contact: ${contact?.name || 'Unknown'}`,
          text: `Contact card for ${contact?.name || 'Unknown'}`,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
          downloadVCard();
        }
      }
    } else {
      downloadVCard();
    }
  };

  const loadSample = () => {
    setInputText(`John Smith
Senior Software Engineer
Acme Corporation
john.smith@acme.com
+1 (555) 123-4567
https://acme.com`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">SigBlock Parser</h1>
          <p className="text-sm md:text-base text-gray-600">Parse email signatures into contacts using AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Signature Block</h2>
              <button
                onClick={loadSample}
                className="text-xs md:text-sm text-blue-600 hover:text-blue-700 px-2 md:px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
              >
                Load Sample
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste signature block here...&#10;&#10;Example:&#10;John Smith&#10;Software Engineer&#10;Acme Corp&#10;john@acme.com&#10;555-1234"
              className="w-full h-48 md:h-64 p-3 md:p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            />

            <button
              onClick={parseSignature}
              disabled={isLoading || !inputText.trim()}
              className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Parsing...
                </>
              ) : (
                'Parse Signature'
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>

            {!contact && !isLoading && (
              <div className="flex flex-col items-center justify-center h-48 md:h-64 text-gray-400">
                <User className="w-12 md:w-16 h-12 md:h-16 mb-3" />
                <p className="text-sm md:text-base">No contact parsed yet</p>
                <p className="text-xs md:text-sm mt-1">Enter a signature and click Parse</p>
              </div>
            )}

            {contact && (
              <div className="space-y-4">
                {/* Contact Fields */}
                <div className="space-y-3">
                  {contact.name && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Name</div>
                        <div className="font-medium text-gray-900">{contact.name}</div>
                      </div>
                    </div>
                  )}

                  {contact.title && (
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Title</div>
                        <div className="text-gray-900">{contact.title}</div>
                      </div>
                    </div>
                  )}

                  {contact.company && (
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Company</div>
                        <div className="text-gray-900">{contact.company}</div>
                      </div>
                    </div>
                  )}

                  {contact.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Email</div>
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Phone</div>
                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {contact.mobile && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Mobile</div>
                        <a href={`tel:${contact.mobile}`} className="text-blue-600 hover:underline">
                          {contact.mobile}
                        </a>
                      </div>
                    </div>
                  )}

                  {(contact.streetAddress || contact.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Address</div>
                        <div className="text-gray-900">
                          {contact.streetAddress && <div>{contact.streetAddress}</div>}
                          {(contact.city || contact.state || contact.postalCode) && (
                            <div>
                              {[contact.city, contact.state, contact.postalCode]
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {contact.extraInfo && contact.extraInfo.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-700 font-medium mb-2">Additional Info</div>
                      <ul className="text-sm text-blue-900 space-y-1">
                        {contact.extraInfo.map((info, i) => (
                          <li key={i}>• {info}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 md:gap-3 pt-4">
                  <button
                    onClick={downloadVCard}
                    className="flex-1 bg-green-600 text-white py-3 px-3 md:px-4 rounded-lg text-sm md:text-base font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                  <button
                    onClick={shareVCard}
                    className="flex-1 bg-purple-600 text-white py-3 px-3 md:px-4 rounded-lg text-sm md:text-base font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                    Share
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Uses Claude AI to intelligently parse any signature format
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Mobile-Friendly</h3>
            <p className="text-sm text-gray-600">
              Share directly to Messages, Mail, Contacts, or any app
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Private</h3>
            <p className="text-sm text-gray-600">
              No data stored. Processing happens securely and ephemerally
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
