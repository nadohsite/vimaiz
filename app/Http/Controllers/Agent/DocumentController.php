<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\AgentProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    protected array $documentTypes = [
        'id_document' => [
            'label' => 'Pièce d\'identité',
            'description' => 'Carte d\'identité ou passeport en cours de validité',
            'required' => true,
            'accept' => 'image/*,.pdf',
            'maxSize' => 5120, // 5MB
        ],
        'address_proof' => [
            'label' => 'Justificatif de domicile',
            'description' => 'Facture de moins de 3 mois (électricité, gaz, téléphone)',
            'required' => true,
            'accept' => 'image/*,.pdf',
            'maxSize' => 5120,
        ],
        'siret_document' => [
            'label' => 'Extrait KBIS ou INSEE',
            'description' => 'Document attestant de votre numéro SIRET',
            'required' => true,
            'accept' => 'image/*,.pdf',
            'maxSize' => 5120,
        ],
        'driving_license_document' => [
            'label' => 'Permis de conduire',
            'description' => 'Recto-verso de votre permis de conduire (optionnel)',
            'required' => false,
            'accept' => 'image/*,.pdf',
            'maxSize' => 5120,
        ],
        'insurance_document' => [
            'label' => 'Attestation d\'assurance RC Pro',
            'description' => 'Responsabilité civile professionnelle (recommandé)',
            'required' => false,
            'accept' => 'image/*,.pdf',
            'maxSize' => 5120,
        ],
    ];

    public function index(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        if (!$agentProfile) {
            $agentProfile = AgentProfile::create([
                'user_id' => $user->id,
                'verification_status' => 'pending',
            ]);
        }

        $documents = [];
        foreach ($this->documentTypes as $type => $config) {
            $filePath = $agentProfile->$type;
            $documents[$type] = [
                ...$config,
                'type' => $type,
                'uploaded' => !empty($filePath),
                'file_path' => $filePath,
                'file_url' => $filePath ? Storage::url($filePath) : null,
            ];
        }

        return Inertia::render('Agent/Documents/Index', [
            'agentProfile' => $agentProfile,
            'documents' => $documents,
            'verificationStatus' => $agentProfile->verification_status,
            'rejectionReason' => $agentProfile->rejection_reason,
        ]);
    }

    public function upload(Request $request, string $type): RedirectResponse
    {
        if (!array_key_exists($type, $this->documentTypes)) {
            return back()->with('error', 'Type de document invalide.');
        }

        $config = $this->documentTypes[$type];

        $request->validate([
            'document' => [
                'required',
                'file',
                'max:' . $config['maxSize'],
                'mimes:jpeg,jpg,png,gif,pdf',
            ],
        ], [
            'document.required' => 'Veuillez sélectionner un fichier.',
            'document.max' => 'Le fichier ne doit pas dépasser ' . ($config['maxSize'] / 1024) . ' Mo.',
            'document.mimes' => 'Format accepté : JPEG, PNG, GIF ou PDF.',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        if (!$agentProfile) {
            return back()->with('error', 'Profil intervenant introuvable.');
        }

        // Delete old file if exists
        if ($agentProfile->$type) {
            Storage::disk('public')->delete($agentProfile->$type);
        }

        // Store new file
        $path = $request->file('document')->store(
            'agent-documents/' . $user->id . '/' . $type,
            'public'
        );

        // Update profile
        $agentProfile->update([
            $type => $path,
            'verification_status' => 'pending', // Reset to pending when new document uploaded
            'rejection_reason' => null,
        ]);

        return back()->with('success', $config['label'] . ' téléchargé avec succès.');
    }

    public function destroy(Request $request, string $type): RedirectResponse
    {
        if (!array_key_exists($type, $this->documentTypes)) {
            return back()->with('error', 'Type de document invalide.');
        }

        /** @var \App\Models\User $user */
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        if (!$agentProfile || !$agentProfile->$type) {
            return back()->with('error', 'Document introuvable.');
        }

        // Delete file
        Storage::disk('public')->delete($agentProfile->$type);

        // Update profile
        $agentProfile->update([
            $type => null,
            'verification_status' => 'pending',
        ]);

        return back()->with('success', 'Document supprimé.');
    }

    public function submitForVerification(Request $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        if (!$agentProfile) {
            return back()->with('error', 'Profil intervenant introuvable.');
        }

        // Check all required documents are uploaded
        $missingDocs = [];
        foreach ($this->documentTypes as $type => $config) {
            if ($config['required'] && empty($agentProfile->$type)) {
                $missingDocs[] = $config['label'];
            }
        }

        if (!empty($missingDocs)) {
            return back()->with('error', 'Documents manquants : ' . implode(', ', $missingDocs));
        }

        $agentProfile->update([
            'verification_status' => 'submitted',
        ]);

        return back()->with('success', 'Vos documents ont été soumis pour vérification. Vous serez notifié une fois la vérification terminée.');
    }
}
