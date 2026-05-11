# Fan Hero Identity Capture System — Developer Brief
Version: V0.1  
Author: Product Management  
Status: MVP Prototype  
Platform: Mobile-first Web App  
Priority: High  
Goal: Improve AI likeness consistency through guided identity capture

---

# Overview

We are building a guided onboarding and identity-capture system for a personalised football merchandise platform.

The purpose of this system is NOT general photography.

The purpose is to:
- collect high-quality identity reference images
- standardise image capture
- improve AI generation consistency
- reduce failed generations
- improve commercial output quality

This system acts as the “identity scanning” layer before AI artwork generation.

The onboarding experience should feel:
- premium
- cinematic
- sports-focused
- guided
- simple
- trustworthy

Reference tone:
- FaceID onboarding
- EA Sports FC
- Nike athlete onboarding
- Apple-style capture UX

Avoid:
- generic form-builder aesthetic
- crypto/web3 visual language
- overcomplicated interfaces

---

# Product Goal

Current AI image generation quality is highly dependent on reference image quality.

Most users upload:
- blurry selfies
- distorted wide-angle photos
- screenshots
- low-light images
- inconsistent angles

This causes:
- poor likeness
- inconsistent identity
- malformed generations
- increased regeneration costs

The onboarding system should solve this by guiding users through structured image capture.

---

# Core User Flow

## Step 1 — Welcome Screen

Display:
- short explanation
- estimated time (~2 mins)
- reassurance about privacy

CTA:
“Create Your Fan Profile”

---

## Step 2 — Camera Permissions

Request:
- camera access

Mobile-first experience required.

Desktop support optional in MVP.

---

## Step 3 — Guided Capture Flow

The system should walk the user through required poses one-by-one.

Each step should include:
- visual example
- pose instructions
- live camera preview
- framing overlay
- capture button

---

# Required Capture Steps

## 1. Neutral Front Portrait
User looks directly at camera with neutral expression.

Purpose:
- baseline facial structure

---

## 2. Smiling Portrait
Natural smile.

Purpose:
- smile lines
- mouth structure

---

## 3. Left 45° Angle

Purpose:
- facial depth
- jawline

---

## 4. Right 45° Angle

Purpose:
- facial depth
- ear structure

---

## 5. Side Profile

Purpose:
- nose silhouette
- head shape

---

## 6. Full Body Standing

Purpose:
- body proportions
- posture

---

## 7. Arms Folded Pose

Purpose:
- “footballer” body language

---

## 8. Celebration Pose

Examples:
- cheering
- fist pump
- shouting

Purpose:
- dynamic sports expressions

---

# UX Requirements

## Visual Style

Must feel:
- premium
- clean
- modern
- sports-commercial

References:
- Nike onboarding
- EAFC menus
- Apple setup screens

Colour palette:
- dark UI
- subtle stadium lighting aesthetic
- minimal accent colours

---

# Camera Overlay Requirements

Each capture screen should contain:
- head alignment guide
- shoulder framing
- distance guidance
- optional silhouette overlay

Goal:
help users naturally position themselves correctly.

---

# Validation Requirements

## MVP Validation

Basic automated checks preferred:

### Check for:
- blurry images
- no face detected
- low lighting
- face too small
- face cropped
- sunglasses
- multiple people

If validation fails:
- explain clearly
- allow retake

Do NOT use aggressive error messaging.

---

# Technical Requirements

## Frontend
- Next.js
- TailwindCSS
- Mobile-first responsive design

## Camera Access
Use:
- browser MediaDevices API

Must support:
- iPhone Safari
- Android Chrome

---

# Image Storage

Store:
- original images
- metadata
- capture step type

Potential backend:
- Supabase Storage
OR
- Firebase Storage

---

# Data Structure

Each user session should contain:

```json
{
  "session_id": "",
  "user_id": "",
  "captures": [
    {
      "type": "neutral_front",
      "image_url": "",
      "timestamp": ""
    }
  ]
}