<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(Request $request): RedirectResponse
    {
        // Store role in session to use it in callback
        if ($request->has('role')) {
            session(['social_auth_role' => $request->get('role')]);
        }

        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            $role = session()->pull('social_auth_role', 'client'); // Default to client if not set

            // Find or create user
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // User exists, update Google ID if not set
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                }
            } else {
                // Create new user with selected role
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => Hash::make(Str::random(32)), // Random password
                    'email_verified_at' => now(), // Auto-verify email for Google users
                    'role' => $role,
                ]);

                // Assign role permissions
                $user->assignRole($role);

                // If agent, create an empty profile
                if ($role === 'agent') {
                    $user->agentProfile()->create([
                        'verification_status' => 'pending',
                        'is_available' => false,
                    ]);
                }
            }

            // Log the user in
            Auth::login($user, true);

            // Redirect based on user role
            return $this->redirectBasedOnRole($user);

        } catch (\Exception $e) {
            return redirect()->route('login')
                ->with('error', 'Unable to login with Google. Please try again.');
        }
    }

    /**
     * Redirect user to appropriate dashboard based on their role.
     */
    protected function redirectBasedOnRole(User $user): RedirectResponse
    {
        return match ($user->role) {
            'admin' => redirect()->intended('/admin'),
            'agent' => redirect()->intended('/agent/dashboard'),
            default => redirect()->intended('/dashboard'),
        };
    }
}
